namespace ApolloShop.Application.Features.Reports.DTOs;

public record TopProductDto(Guid ProductId, string ProductName, int QuantitySold, decimal Revenue);

public record DashboardReportDto(
    int UserCount,
    int OrderCount,
    decimal TotalSales,
    decimal TodaySales,
    decimal MonthSales,
    int PendingOrders,
    int CompletedOrders,
    int ProductCount,
    int OpenTickets,
    IReadOnlyList<TopProductDto> TopProducts);
