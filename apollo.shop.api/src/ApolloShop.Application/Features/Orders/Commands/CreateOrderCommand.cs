using System.Text.Json;
using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Orders.DTOs;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Orders.Commands;

public record CreateOrderCommand(Guid AddressId, string? Notes) : IRequest<OrderDetailDto>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;
    private readonly ISmsSender _smsSender;

    public CreateOrderCommandHandler(
        IApplicationDbContext db,
        ICurrentUser currentUser,
        IDateTimeProvider clock,
        ISmsSender smsSender)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
        _smsSender = smsSender;
    }

    public async Task<OrderDetailDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");

        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == request.AddressId && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address", request.AddressId);

        var cart = await _db.Carts.Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken)
            ?? throw new ApolloShop.Domain.Exceptions.ValidationException("Cart", "Cart is empty.");

        if (cart.Items.Count == 0)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Cart", "Cart is empty.");
        }

        var variantIds = cart.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await _db.ProductVariants
            .Include(v => v.Product)
            .Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var cartItem in cart.Items)
        {
            if (!variants.TryGetValue(cartItem.ProductVariantId, out var variant) || !variant.IsActive)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException("Cart", "One or more cart items are unavailable.");
            }

            if (!variant.Product.IsAvailable)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException(
                    "Cart",
                    $"Product «{variant.Product.Name}» is not available for purchase.");
            }

            var product = variant.Product;
            if (product.TrackInventory)
            {
                if (product.StockQuantity < cartItem.Quantity || variant.StockQuantity < cartItem.Quantity)
                {
                    throw new ApolloShop.Domain.Exceptions.ValidationException(
                        "Stock",
                        $"Insufficient stock for SKU {variant.Sku}.");
                }

                if (cartItem.Quantity < product.MinOrderQuantity)
                {
                    throw new ApolloShop.Domain.Exceptions.ValidationException(
                        "Quantity",
                        $"Minimum order quantity is {product.MinOrderQuantity}.");
                }

                if (product.MaxOrderQuantity is int maxOrder && cartItem.Quantity > maxOrder)
                {
                    throw new ApolloShop.Domain.Exceptions.ValidationException(
                        "Quantity",
                        $"Maximum order quantity is {maxOrder}.");
                }
            }

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = variant.ProductId,
                ProductVariantId = variant.Id,
                ProductName = variant.Product.Name,
                Sku = variant.Sku,
                UnitPrice = cartItem.UnitPriceSnapshot,
                Quantity = cartItem.Quantity,
                LineTotal = cartItem.UnitPriceSnapshot * cartItem.Quantity,
                SelectedOptionsJson = cartItem.SelectedOptionsJson
            });

            subtotal += cartItem.UnitPriceSnapshot * cartItem.Quantity;

            if (product.TrackInventory)
            {
                product.StockQuantity = Math.Max(0, product.StockQuantity - cartItem.Quantity);
                variant.StockQuantity = product.StockQuantity;
                if (product.StockQuantity <= 0)
                {
                    product.IsAvailable = false;
                    product.StockQuantity = 0;
                    variant.StockQuantity = 0;
                }
            }
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"APO-{_clock.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
            UserId = userId,
            Status = OrderStatus.Pending,
            Subtotal = subtotal,
            DiscountAmount = 0,
            ShippingAmount = 0,
            TaxAmount = 0,
            GrandTotal = subtotal,
            Currency = "IRR",
            ShippingAddressSnapshot = JsonSerializer.Serialize(new
            {
                address.Title,
                address.FullName,
                address.Phone,
                address.Province,
                address.City,
                address.PostalCode,
                address.Line1,
                address.Line2
            }),
            Notes = request.Notes,
            CreatedAtUtc = _clock.UtcNow,
            Items = orderItems
        };

        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
        }

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Amount = order.GrandTotal,
            Status = PaymentStatus.Pending,
            Gateway = "Mock",
            CreatedAtUtc = _clock.UtcNow
        };

        _db.Orders.Add(order);
        _db.Payments.Add(payment);
        _db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAtUtc = _clock.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        await TrySendOrderSmsAsync(address.Phone, order, cancellationToken);

        return OrderMapper.ToDetail(order, _currentUser.Email);
    }

    private async Task TrySendOrderSmsAsync(string? phone, Order order, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return;
        }

        var settings = await _db.ShopSettings.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
        if (settings is null || !settings.SmsOrderEnabled)
        {
            return;
        }

        try
        {
            var total = $"{order.GrandTotal:N0}";
            await _smsSender.SendOrderAsync(phone, order.OrderNumber, total, cancellationToken);
        }
        catch
        {
            // Order is already persisted; SMS failures must not roll back checkout.
        }
    }
}
