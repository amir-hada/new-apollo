using System.Text.RegularExpressions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Commands;

internal static class ProductWriteHelper
{
    /// <summary>
    /// اسلاگ خالی/فقط خط‌تیره → از نام با جایگزینی فاصله با «-».
    /// </summary>
    public static string ResolveSlug(string? slug, string name)
    {
        var trimmed = (slug ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.All(static c => c is '-' or '_'))
        {
            trimmed = Regex.Replace((name ?? string.Empty).Trim(), @"\s+", "-");
        }

        return trimmed.ToLowerInvariant();
    }

    public static string? TrimSeo(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }

    public static void ApplyImagesAndSpecs(
        Product product,
        IReadOnlyList<UpsertProductImageRequest>? images,
        IReadOnlyList<UpsertProductSpecRequest>? specs,
        bool replaceExisting)
    {
        if (!replaceExisting)
        {
            AppendImages(product, images);
            AppendSpecs(product, specs);
            return;
        }

        SyncImages(product, images ?? []);
        // Specs are fully replaced on update via UpdateProductCommand.ReplaceSpecs.
        AppendSpecs(product, specs);
    }

    private static void AppendImages(Product product, IReadOnlyList<UpsertProductImageRequest>? images)
    {
        foreach (var image in images ?? [])
        {
            product.Images.Add(CreateImage(product.Id, image));
        }
    }

    private static void AppendSpecs(Product product, IReadOnlyList<UpsertProductSpecRequest>? specs)
    {
        var sort = product.Specs.Count;
        foreach (var spec in specs ?? [])
        {
            var name = spec.Name.Trim();
            if (string.IsNullOrWhiteSpace(name)) continue;

            var values = (spec.Values ?? [])
                .Where(v => !string.IsNullOrWhiteSpace(v.Value))
                .OrderBy(v => v.SortOrder)
                .ToList();
            if (values.Count == 0) continue;

            sort += 1;
            var isOrderParameter = spec.IsOrderParameter && values.Count >= 2;
            var entity = new ProductSpecification
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Name = name,
                IsOrderParameter = isOrderParameter,
                SortOrder = sort
            };

            var valueSort = 0;
            foreach (var value in values)
            {
                valueSort += 1;
                entity.Values.Add(new ProductSpecificationValue
                {
                    Id = Guid.NewGuid(),
                    SpecificationId = entity.Id,
                    Value = value.Value.Trim(),
                    ColorHex = NormalizeColorHex(value.ColorHex),
                    PriceAdjustment = isOrderParameter ? value.PriceAdjustment : 0,
                    SortOrder = valueSort
                });
            }

            product.Specs.Add(entity);
        }
    }

    private static void SyncImages(Product product, IReadOnlyList<UpsertProductImageRequest> images)
    {
        var keepIds = images
            .Where(i => i.Id is Guid id && id != Guid.Empty)
            .Select(i => i.Id!.Value)
            .ToHashSet();

        foreach (var existing in product.Images.Where(i => !keepIds.Contains(i.Id)).ToList())
        {
            product.Images.Remove(existing);
        }

        foreach (var image in images)
        {
            if (image.Id is Guid id && id != Guid.Empty)
            {
                var existing = product.Images.FirstOrDefault(i => i.Id == id);
                if (existing is not null)
                {
                    existing.ImagePath = image.ImagePath;
                    existing.AlternativeText = image.AlternativeText;
                    existing.SortOrder = image.SortOrder;
                    existing.IsPrimary = image.IsPrimary;
                    existing.MediaKind = image.MediaKind;
                    continue;
                }
            }

            product.Images.Add(CreateImage(product.Id, image));
        }
    }

    private static ProductImage CreateImage(Guid productId, UpsertProductImageRequest image) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ImagePath = image.ImagePath,
            AlternativeText = image.AlternativeText,
            SortOrder = image.SortOrder,
            IsPrimary = image.IsPrimary,
            MediaKind = image.MediaKind
        };

    /// <summary>
    /// Cart/order still use variants; keep a single default variant in sync with product pricing/stock/sku.
    /// </summary>
    public static string ResolveVariantSku(Product product) =>
        string.IsNullOrWhiteSpace(product.Sku)
            ? $"SKU-{product.ProductCode}"
            : product.Sku.Trim();

    public static void SyncDefaultVariant(Product product)
    {
        var variant = product.Variants.FirstOrDefault();
        var selling = product.DiscountPrice ?? product.BasePrice;
        var compare = product.DiscountPrice.HasValue ? product.BasePrice : (decimal?)null;
        var variantSku = ResolveVariantSku(product);
        if (variant is null)
        {
            product.Variants.Add(new ProductVariant
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Sku = variantSku,
                Name = "پیش‌فرض",
                Price = selling,
                CompareAtPrice = compare,
                StockQuantity = product.StockQuantity,
                IsActive = true
            });
            return;
        }

        variant.Sku = variantSku;
        variant.Price = selling;
        variant.CompareAtPrice = compare;
        variant.StockQuantity = product.StockQuantity;
        variant.IsActive = true;
    }

    public static async Task<string> NextProductCodeAsync(
        Abstractions.IApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var codes = await db.ProductsIncludingDeleted
            .Select(p => p.ProductCode)
            .ToListAsync(cancellationToken);

        var max = 0;
        foreach (var code in codes)
        {
            if (int.TryParse(code, out var n) && n > max) max = n;
        }

        return (max + 1).ToString("D4");
    }

    public static string? NormalizeColorHex(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var hex = raw.Trim();
        if (!hex.StartsWith('#')) hex = "#" + hex;
        if (hex.Length is not (4 or 7)) return null;
        for (var i = 1; i < hex.Length; i++)
        {
            var c = hex[i];
            var ok = (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
            if (!ok) return null;
        }
        return hex.ToLowerInvariant();
    }
}
