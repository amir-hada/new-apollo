using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Reports.DTOs;
using ApolloShop.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Reports.Queries;

public record GetDashboardReportQuery : IRequest<DashboardReportDto>;

public class GetDashboardReportQueryHandler : IRequestHandler<GetDashboardReportQuery, DashboardReportDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public GetDashboardReportQueryHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<DashboardReportDto> Handle(GetDashboardReportQuery request, CancellationToken cancellationToken)
    {
        var now = _clock.UtcNow;
        var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var paidStatuses = new[]
        {
            OrderStatus.Paid,
            OrderStatus.Processing,
            OrderStatus.Shipped,
            OrderStatus.Delivered
        };

        var userCount = await _db.Users.CountAsync(cancellationToken);
        var orderCount = await _db.Orders.CountAsync(cancellationToken);
        var productCount = await _db.Products.CountAsync(cancellationToken);
        var pendingOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Pending, cancellationToken);
        var completedOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Delivered, cancellationToken);
        var openTickets = await _db.Tickets.CountAsync(
            t => t.Status == TicketStatus.Open
                 || t.Status == TicketStatus.InProgress
                 || t.Status == TicketStatus.WaitingOnCustomer,
            cancellationToken);

        var totalSales = await _db.Orders
            .Where(o => paidStatuses.Contains(o.Status))
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;

        var todaySales = await _db.Orders
            .Where(o => paidStatuses.Contains(o.Status) && o.PaidAtUtc >= todayStart)
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;

        var monthSales = await _db.Orders
            .Where(o => paidStatuses.Contains(o.Status) && o.PaidAtUtc >= monthStart)
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;

        var topProducts = await (
                from oi in _db.OrderItems.AsNoTracking()
                join o in _db.Orders.AsNoTracking() on oi.OrderId equals o.Id
                where paidStatuses.Contains(o.Status)
                group oi by new { oi.ProductId, oi.ProductName }
                into g
                select new TopProductDto(
                    g.Key.ProductId,
                    g.Key.ProductName,
                    g.Sum(x => x.Quantity),
                    g.Sum(x => x.LineTotal))
            )
            .OrderByDescending(x => x.QuantitySold)
            .Take(10)
            .ToListAsync(cancellationToken);

        return new DashboardReportDto(
            userCount,
            orderCount,
            totalSales,
            todaySales,
            monthSales,
            pendingOrders,
            completedOrders,
            productCount,
            openTickets,
            topProducts);
    }
}
