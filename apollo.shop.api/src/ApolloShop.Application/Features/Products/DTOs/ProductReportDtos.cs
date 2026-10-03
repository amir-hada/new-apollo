namespace ApolloShop.Application.Features.Products.DTOs;

public record ProductReportDayDto(
    string Date,
    int UnitsSold,
    decimal Revenue,
    int Views,
    int Likes,
    int Comments);

public record ProductVariantSalesDto(
    Guid VariantId,
    string Sku,
    string Name,
    int UnitsSold,
    decimal Revenue);

public record ProductReportDto(
    Guid ProductId,
    string ProductName,
    int Days,
    decimal Revenue,
    int UnitsSold,
    int OrderCount,
    decimal AverageOrderValue,
    int ReturnedUnits,
    int Views,
    int UniqueViews,
    int Likes,
    int Comments,
    double? AverageRating,
    int CartQuantity,
    decimal ConversionRatePercent,
    int StockQuantity,
    bool TrackInventory,
    IReadOnlyList<ProductReportDayDto> Timeline,
    IReadOnlyList<ProductVariantSalesDto> VariantSales);
