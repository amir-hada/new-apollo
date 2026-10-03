using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Cart.DTOs;
using ApolloShop.Application.Features.Products;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Cart.Queries;

internal static class CartMapper
{
    public static async Task<CartDto> MapAsync(IApplicationDbContext db, ApolloShop.Domain.Entities.Commerce.Cart cart, CancellationToken cancellationToken)
    {
        var variantIds = cart.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await db.ProductVariants
            .AsNoTracking()
            .Include(v => v.Product)
            .Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        var items = new List<CartItemDto>();
        foreach (var item in cart.Items)
        {
            if (!variants.TryGetValue(item.ProductVariantId, out var variant) || !variant.IsActive)
            {
                continue;
            }

            var options = ProductSpecPricing.Deserialize(item.SelectedOptionsJson)
                .Select(o => new CartSelectedOptionDto(
                    o.SpecificationId, o.Name, o.ValueId, o.Value, o.PriceAdjustment))
                .ToList();

            var unitPrice = item.UnitPriceSnapshot;
            items.Add(new CartItemDto(
                item.Id,
                variant.Id,
                variant.ProductId,
                variant.Product.Name,
                variant.Product.Slug,
                variant.Name,
                variant.Sku,
                item.Quantity,
                unitPrice,
                unitPrice * item.Quantity,
                variant.StockQuantity,
                options));
        }

        return new CartDto(cart.Id, items, items.Sum(i => i.LineTotal), items.Sum(i => i.Quantity));
    }
}
