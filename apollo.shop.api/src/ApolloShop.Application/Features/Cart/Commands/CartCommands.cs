using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Cart.DTOs;
using ApolloShop.Application.Features.Cart.Queries;
using ApolloShop.Application.Features.Products;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Cart.Commands;

public record AddCartItemCommand(
    Guid? UserId,
    string? GuestToken,
    Guid ProductVariantId,
    int Quantity,
    IReadOnlyList<Guid>? SelectedSpecValueIds) : IRequest<CartDto>;
public record UpdateCartItemCommand(Guid? UserId, string? GuestToken, Guid CartItemId, int Quantity) : IRequest<CartDto>;
public record RemoveCartItemCommand(Guid? UserId, string? GuestToken, Guid CartItemId) : IRequest<CartDto>;

public class AddCartItemCommandHandler : IRequestHandler<AddCartItemCommand, CartDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public AddCartItemCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<CartDto> Handle(AddCartItemCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Quantity", "Quantity must be greater than zero.");
        }

        var variant = await _db.ProductVariants
            .AsNoTracking()
            .Include(v => v.Product)
                .ThenInclude(p => p.Specs)
                    .ThenInclude(s => s.Values)
            .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId && v.IsActive, cancellationToken)
            ?? throw new NotFoundException("ProductVariant", request.ProductVariantId);

        var product = variant.Product;
        if (!product.IsAvailable)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Product", "Product is not available.");
        }

        var selectedOptions = ProductSpecPricing.ResolveSelections(product, request.SelectedSpecValueIds);
        var unitPrice = ProductSpecPricing.UnitPriceWithOptions(product, selectedOptions);
        var optionsJson = ProductSpecPricing.Serialize(selectedOptions);

        if (product.TrackInventory && variant.StockQuantity < request.Quantity)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Quantity", "Insufficient stock.");
        }

        var cart = await CartResolver.GetOrCreateAsync(_db, _clock, request.UserId, request.GuestToken, cancellationToken);

        // Unique index is (CartId, ProductVariantId) — match on variant only.
        var existing = cart.Items.FirstOrDefault(i => i.ProductVariantId == variant.Id);
        var newQty = (existing?.Quantity ?? 0) + request.Quantity;

        if (product.TrackInventory)
        {
            if (newQty < product.MinOrderQuantity)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException(
                    "Quantity",
                    $"Minimum order quantity is {product.MinOrderQuantity}.");
            }

            if (product.MaxOrderQuantity is int maxOrder && newQty > maxOrder)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException(
                    "Quantity",
                    $"Maximum order quantity is {maxOrder}.");
            }

            if (variant.StockQuantity < newQty)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException("Quantity", "Insufficient stock.");
            }
        }

        if (existing is null)
        {
            var item = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductVariantId = variant.Id,
                Quantity = request.Quantity,
                UnitPriceSnapshot = unitPrice,
                SelectedOptionsJson = optionsJson
            };
            cart.Items.Add(item);
            _db.CartItems.Add(item);
        }
        else
        {
            existing.Quantity = newQty;
            existing.UnitPriceSnapshot = unitPrice;
            existing.SelectedOptionsJson = optionsJson;
        }

        cart.UpdatedAtUtc = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return await CartMapper.MapAsync(_db, cart, cancellationToken);
    }
}

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, CartDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public UpdateCartItemCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<CartDto> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Quantity", "Quantity must be greater than zero.");
        }

        var cart = await CartResolver.GetRequiredAsync(_db, request.UserId, request.GuestToken, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == request.CartItemId)
            ?? throw new NotFoundException("CartItem", request.CartItemId);

        var variant = await _db.ProductVariants
            .AsNoTracking()
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId, cancellationToken)
            ?? throw new NotFoundException("ProductVariant", item.ProductVariantId);

        var product = variant.Product;
        if (product.TrackInventory)
        {
            if (request.Quantity < product.MinOrderQuantity)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException(
                    "Quantity",
                    $"Minimum order quantity is {product.MinOrderQuantity}.");
            }

            if (product.MaxOrderQuantity is int maxOrder && request.Quantity > maxOrder)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException(
                    "Quantity",
                    $"Maximum order quantity is {maxOrder}.");
            }

            if (variant.StockQuantity < request.Quantity)
            {
                throw new ApolloShop.Domain.Exceptions.ValidationException("Quantity", "Insufficient stock.");
            }
        }

        item.Quantity = request.Quantity;
        item.UnitPriceSnapshot = variant.Price;
        cart.UpdatedAtUtc = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return await CartMapper.MapAsync(_db, cart, cancellationToken);
    }
}

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, CartDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public RemoveCartItemCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<CartDto> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var cart = await CartResolver.GetRequiredAsync(_db, request.UserId, request.GuestToken, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == request.CartItemId)
            ?? throw new NotFoundException("CartItem", request.CartItemId);

        _db.CartItems.Remove(item);
        cart.UpdatedAtUtc = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return await CartMapper.MapAsync(_db, cart, cancellationToken);
    }
}
