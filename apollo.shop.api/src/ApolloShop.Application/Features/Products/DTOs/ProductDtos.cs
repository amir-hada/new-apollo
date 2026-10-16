using ApolloShop.Domain.Enums;

namespace ApolloShop.Application.Features.Products.DTOs;

public record ProductImageDto(
    Guid? Id,
    string ImagePath,
    string? AlternativeText,
    int SortOrder,
    bool IsPrimary,
    ProductMediaKind MediaKind);

public record ProductSpecValueDto(
    Guid? Id,
    string Value,
    decimal PriceAdjustment,
    int SortOrder,
    string? ColorHex = null);

public record ProductSpecDto(
    Guid? Id,
    string Name,
    bool IsOrderParameter,
    int SortOrder,
    IReadOnlyList<ProductSpecValueDto> Values);

public record ProductListItemDto(
    Guid Id,
    string Name,
    string Slug,
    string ProductCode,
    string? Sku,
    decimal BasePrice,
    decimal? DiscountPrice,
    ProductStatus Status,
    bool IsAvailable,
    string? BrandName,
    string? CategoryName,
    string? PrimaryImageUrl,
    int StockQuantity,
    double? AverageRating = null,
    int RatingCount = 0,
    int TotalSales = 0,
    decimal TotalRevenue = 0,
    IReadOnlyList<decimal>? RevenueTrend = null);

public record ProductVariantDto(
    Guid Id,
    string Sku,
    string Name,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQuantity,
    bool IsActive);

public record ProductDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    Guid? BrandId,
    string? BrandName,
    string? BrandSlug,
    Guid? CategoryId,
    string? CategoryName,
    string? CategorySlug,
    bool IsAvailable,
    ProductStatus Status,
    string ProductCode,
    string? Sku,
    decimal BasePrice,
    decimal? DiscountPrice,
    int StockQuantity,
    bool TrackInventory,
    bool ShowStockInStore,
    int? StockDisplayThreshold,
    int MinOrderQuantity,
    int? MaxOrderQuantity,
    string? SeoTitle,
    string? SeoDescription,
    string? SeoKeywords,
    string? FocusKeyword,
    string? CanonicalUrl,
    bool RobotsNoIndex,
    bool RobotsNoFollow,
    string? OgTitle,
    string? OgDescription,
    string? OgImageUrl,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductSpecDto> Specs,
    /// <summary>Read-only default variant(s) for cart compatibility.</summary>
    IReadOnlyList<ProductVariantDto> Variants,
    double? AverageRating = null,
    int RatingCount = 0,
    int CommentCount = 0);

public record UpsertProductImageRequest(
    Guid? Id,
    string ImagePath,
    string? AlternativeText,
    int SortOrder,
    bool IsPrimary,
    ProductMediaKind MediaKind = ProductMediaKind.Image);

public record UpsertProductSpecValueRequest(
    Guid? Id,
    string Value,
    decimal PriceAdjustment,
    int SortOrder,
    string? ColorHex = null);

public record UpsertProductSpecRequest(
    Guid? Id,
    string Name,
    bool IsOrderParameter,
    int SortOrder,
    IReadOnlyList<UpsertProductSpecValueRequest> Values);

public record CreateProductRequest(
    string Name,
    string Slug,
    string Description,
    Guid? BrandId,
    Guid? CategoryId,
    bool IsAvailable,
    ProductStatus Status,
    decimal BasePrice,
    decimal? DiscountPrice,
    int StockQuantity,
    bool TrackInventory,
    bool ShowStockInStore,
    int? StockDisplayThreshold,
    int MinOrderQuantity,
    int? MaxOrderQuantity,
    string? SeoTitle,
    string? SeoDescription,
    string? SeoKeywords,
    string? FocusKeyword,
    string? CanonicalUrl,
    bool RobotsNoIndex,
    bool RobotsNoFollow,
    string? OgTitle,
    string? OgDescription,
    string? OgImageUrl,
    string? Sku,
    IReadOnlyList<UpsertProductImageRequest>? Images,
    IReadOnlyList<UpsertProductSpecRequest>? Specs);

public record UpdateProductRequest(
    string Name,
    string Slug,
    string Description,
    Guid? BrandId,
    Guid? CategoryId,
    bool IsAvailable,
    ProductStatus Status,
    decimal BasePrice,
    decimal? DiscountPrice,
    int StockQuantity,
    bool TrackInventory,
    bool ShowStockInStore,
    int? StockDisplayThreshold,
    int MinOrderQuantity,
    int? MaxOrderQuantity,
    string? SeoTitle,
    string? SeoDescription,
    string? SeoKeywords,
    string? FocusKeyword,
    string? CanonicalUrl,
    bool RobotsNoIndex,
    bool RobotsNoFollow,
    string? OgTitle,
    string? OgDescription,
    string? OgImageUrl,
    string? Sku,
    IReadOnlyList<UpsertProductImageRequest>? Images,
    IReadOnlyList<UpsertProductSpecRequest>? Specs);
