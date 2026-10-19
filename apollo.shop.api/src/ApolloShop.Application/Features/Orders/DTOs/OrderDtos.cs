using ApolloShop.Domain.Enums;

namespace ApolloShop.Application.Features.Orders.DTOs;

public record OrderSelectedOptionDto(
    Guid SpecificationId,
    string Name,
    Guid ValueId,
    string Value,
    decimal PriceAdjustment);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    Guid ProductVariantId,
    string ProductName,
    string Sku,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    IReadOnlyList<OrderSelectedOptionDto> SelectedOptions);
public record OrderListItemDto(Guid Id, string OrderNumber, OrderStatus Status, decimal GrandTotal, DateTime CreatedAtUtc, string? CustomerEmail);
public record OrderDetailDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal Subtotal,
    decimal DiscountAmount,
    decimal ShippingAmount,
    decimal TaxAmount,
    decimal GrandTotal,
    string Currency,
    string ShippingAddressSnapshot,
    string? Notes,
    DateTime CreatedAtUtc,
    DateTime? PaidAtUtc,
    Guid UserId,
    string? CustomerEmail,
    IReadOnlyList<OrderItemDto> Items);

public record CreateOrderRequest(Guid AddressId, string? Notes, string? CouponCode = null);
public record UpdateOrderStatusRequest(OrderStatus Status);
