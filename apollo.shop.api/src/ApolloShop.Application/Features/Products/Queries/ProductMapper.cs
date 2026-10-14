using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Queries;

internal static class ProductMapper
{
    public static async Task<Product?> LoadAsync(IApplicationDbContext db, string key, bool bySlug, CancellationToken cancellationToken)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Specs)
                .ThenInclude(s => s.Values)
            .AsQueryable();

        if (bySlug)
        {
            return await query.FirstOrDefaultAsync(p => p.Slug == key, cancellationToken);
        }

        if (!Guid.TryParse(key, out var id))
        {
            return null;
        }

        return await query.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public static async Task<ProductDetailDto> ToDetailAsync(
        IApplicationDbContext db,
        Product p,
        CancellationToken cancellationToken)
    {
        var approved = db.ProductComments.AsNoTracking()
            .Where(c => c.ProductId == p.Id && c.IsApproved);

        var commentCount = await approved.CountAsync(cancellationToken);
        var rated = approved.Where(c => c.Rating != null);
        var ratingCount = await rated.CountAsync(cancellationToken);
        double? averageRating = ratingCount > 0
            ? await rated.AverageAsync(c => (double)c.Rating!, cancellationToken)
            : null;

        return ToDetail(p, averageRating, ratingCount, commentCount);
    }

    public static ProductDetailDto ToDetail(
        Product p,
        double? averageRating = null,
        int ratingCount = 0,
        int commentCount = 0) =>
        new(
            p.Id,
            p.Name,
            p.Slug,
            p.Description,
            p.BrandId,
            p.Brand?.Name,
            p.Brand?.Slug,
            p.CategoryId,
            p.Category?.Name,
            p.Category?.Slug,
            p.IsAvailable,
            p.Status,
            p.ProductCode,
            p.Sku,
            p.BasePrice,
            p.DiscountPrice,
            p.StockQuantity,
            p.TrackInventory,
            p.ShowStockInStore,
            p.StockDisplayThreshold,
            p.MinOrderQuantity,
            p.MaxOrderQuantity,
            p.SeoTitle,
            p.SeoDescription,
            p.SeoKeywords,
            p.FocusKeyword,
            p.CanonicalUrl,
            p.RobotsNoIndex,
            p.RobotsNoFollow,
            p.OgTitle,
            p.OgDescription,
            p.OgImageUrl,
            p.CreatedAtUtc,
            p.UpdatedAtUtc,
            p.Images.OrderBy(i => i.SortOrder)
                .Select(i => new ProductImageDto(i.Id, i.ImagePath, i.AlternativeText, i.SortOrder, i.IsPrimary, i.MediaKind))
                .ToList(),
            p.Specs.OrderBy(s => s.SortOrder)
                .Select(s => new ProductSpecDto(
                    s.Id,
                    s.Name,
                    s.IsOrderParameter,
                    s.SortOrder,
                    s.Values.OrderBy(v => v.SortOrder)
                        .Select(v => new ProductSpecValueDto(v.Id, v.Value, v.PriceAdjustment, v.SortOrder))
                        .ToList()))
                .ToList(),
            p.Variants
                .Select(v => new ProductVariantDto(
                    v.Id, v.Sku, v.Name, v.Price, v.CompareAtPrice, v.StockQuantity, v.IsActive))
                .ToList(),
            averageRating,
            ratingCount,
            commentCount);
}
