using ApolloShop.Application.Features.Orders.DTOs;
using ApolloShop.Application.Features.Products;
using ApolloShop.Domain.Entities.Commerce;

namespace ApolloShop.Application.Features.Orders;

internal static class OrderMapper
{
    public static OrderDetailDto ToDetail(Order order, string? customerEmail = null) =>
        new(
            order.Id,
            order.OrderNumber,
            order.Status,
            order.Subtotal,
            order.DiscountAmount,
            order.ShippingAmount,
            order.TaxAmount,
            order.GrandTotal,
            order.Currency,
            order.ShippingAddressSnapshot,
            order.Notes,
            order.CreatedAtUtc,
            order.PaidAtUtc,
            order.UserId,
            customerEmail ?? order.User?.Email,
            order.Items.Select(i =>
            {
                var options = ProductSpecPricing.Deserialize(i.SelectedOptionsJson)
                    .Select(o => new OrderSelectedOptionDto(
                        o.SpecificationId, o.Name, o.ValueId, o.Value, o.PriceAdjustment))
                    .ToList();
                return new OrderItemDto(
                    i.Id,
                    i.ProductId,
                    i.ProductVariantId,
                    i.ProductName,
                    i.Sku,
                    i.UnitPrice,
                    i.Quantity,
                    i.LineTotal,
                    options);
            }).ToList());
}
