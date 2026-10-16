namespace ApolloShop.Application.Features.Reports.DTOs;

public record TopProductDto(
    Guid ProductId,
    string ProductName,
    int QuantitySold,
    decimal Revenue,
    int Views,
    int Likes);

public record DashboardDayPointDto(
    DateOnly Date,
    decimal Sales,
    int Orders,
    int Views,
    int NewUsers);

public record OrderStatusCountDto(string Status, int Count);

public record DashboardReportDto(
    int UserCount,
    int OrderCount,
    decimal TotalSales,
    decimal TodaySales,
    decimal YesterdaySales,
    decimal WeekSales,
    decimal MonthSales,
    decimal AverageOrderValue,
    int TodayOrders,
    int PendingOrders,
    int CompletedOrders,
    int CancelledOrders,
    int ReturnedOrders,
    int ProductCount,
    int LowStockProducts,
    int OpenTickets,
    int TodayViews,
    int TotalViews,
    int TotalLikes,
    int TotalComments,
    int NewUsersToday,
    int NewUsersMonth,
    double ConversionRatePercent,
    IReadOnlyList<DashboardDayPointDto> Last30Days,
    IReadOnlyList<OrderStatusCountDto> OrdersByStatus,
    IReadOnlyList<TopProductDto> TopProducts,
    IReadOnlyList<TopProductDto> TopViewedProducts);
