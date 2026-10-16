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
        var yesterdayStart = todayStart.AddDays(-1);
        var weekStart = todayStart.AddDays(-6);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var from30 = todayStart.AddDays(-29);

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
        var cancelledOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Cancelled, cancellationToken);
        var returnedOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Returned, cancellationToken);
        var openTickets = await _db.Tickets.CountAsync(
            t => t.Status == TicketStatus.Open
                 || t.Status == TicketStatus.InProgress
                 || t.Status == TicketStatus.WaitingOnCustomer,
            cancellationToken);

        var lowStockProducts = await _db.Products
            .CountAsync(
                p => p.TrackInventory
                     && p.StockQuantity <= (p.StockDisplayThreshold ?? 5),
                cancellationToken);

        var paidOrders = _db.Orders.AsNoTracking().Where(o => paidStatuses.Contains(o.Status));

        var totalSales = await paidOrders.SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;
        var todaySales = await paidOrders
            .Where(o => o.PaidAtUtc >= todayStart)
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;
        var yesterdaySales = await paidOrders
            .Where(o => o.PaidAtUtc >= yesterdayStart && o.PaidAtUtc < todayStart)
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;
        var weekSales = await paidOrders
            .Where(o => o.PaidAtUtc >= weekStart)
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;
        var monthSales = await paidOrders
            .Where(o => o.PaidAtUtc >= monthStart)
            .SumAsync(o => (decimal?)o.GrandTotal, cancellationToken) ?? 0;

        var paidOrderCount = await paidOrders.CountAsync(cancellationToken);
        var averageOrderValue = paidOrderCount == 0 ? 0 : Math.Round(totalSales / paidOrderCount, 0);

        var todayOrders = await _db.Orders.CountAsync(o => o.CreatedAtUtc >= todayStart, cancellationToken);

        var todayViews = await _db.ProductViews.CountAsync(v => v.CreatedAtUtc >= todayStart, cancellationToken);
        var totalViews = await _db.ProductViews.CountAsync(cancellationToken);
        var totalLikes = await _db.ProductLikes.CountAsync(cancellationToken);
        var totalComments = await _db.ProductComments.CountAsync(c => c.IsApproved, cancellationToken);

        var newUsersToday = await _db.Users.CountAsync(u => u.CreatedAtUtc >= todayStart, cancellationToken);
        var newUsersMonth = await _db.Users.CountAsync(u => u.CreatedAtUtc >= monthStart, cancellationToken);

        var conversionRate = totalViews == 0
            ? 0
            : Math.Round(100.0 * paidOrderCount / totalViews, 2);

        var salesByDay = await paidOrders
            .Where(o => o.PaidAtUtc != null && o.PaidAtUtc >= from30)
            .GroupBy(o => o.PaidAtUtc!.Value.Date)
            .Select(g => new
            {
                Day = g.Key,
                Sales = g.Sum(x => x.GrandTotal),
                Orders = g.Count()
            })
            .ToListAsync(cancellationToken);

        var viewsByDay = await _db.ProductViews.AsNoTracking()
            .Where(v => v.CreatedAtUtc >= from30)
            .GroupBy(v => v.CreatedAtUtc.Date)
            .Select(g => new { Day = g.Key, Views = g.Count() })
            .ToListAsync(cancellationToken);

        var usersByDay = await _db.Users.AsNoTracking()
            .Where(u => u.CreatedAtUtc >= from30)
            .GroupBy(u => u.CreatedAtUtc.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var salesMap = salesByDay.ToDictionary(x => x.Day, x => x);
        var viewsMap = viewsByDay.ToDictionary(x => x.Day, x => x.Views);
        var usersMap = usersByDay.ToDictionary(x => x.Day, x => x.Count);

        var last30Days = new List<DashboardDayPointDto>(30);
        for (var i = 0; i < 30; i++)
        {
            var day = from30.AddDays(i).Date;
            salesMap.TryGetValue(day, out var salesPoint);
            viewsMap.TryGetValue(day, out var views);
            usersMap.TryGetValue(day, out var newUsers);
            last30Days.Add(new DashboardDayPointDto(
                DateOnly.FromDateTime(day),
                salesPoint?.Sales ?? 0,
                salesPoint?.Orders ?? 0,
                views,
                newUsers));
        }

        var statusCounts = await _db.Orders.AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var ordersByStatus = Enum.GetValues<OrderStatus>()
            .Select(status => new OrderStatusCountDto(
                status.ToString(),
                statusCounts.FirstOrDefault(x => x.Status == status)?.Count ?? 0))
            .ToList();

        var topProductsRaw = await (
                from oi in _db.OrderItems.AsNoTracking()
                join o in _db.Orders.AsNoTracking() on oi.OrderId equals o.Id
                where paidStatuses.Contains(o.Status)
                group oi by new { oi.ProductId, oi.ProductName }
                into g
                select new
                {
                    g.Key.ProductId,
                    g.Key.ProductName,
                    QuantitySold = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.LineTotal)
                })
            .OrderByDescending(x => x.QuantitySold)
            .Take(10)
            .ToListAsync(cancellationToken);

        var topProductIds = topProductsRaw.Select(x => x.ProductId).ToList();
        var viewCounts = await _db.ProductViews.AsNoTracking()
            .Where(v => topProductIds.Contains(v.ProductId))
            .GroupBy(v => v.ProductId)
            .Select(g => new { ProductId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);
        var likeCounts = await _db.ProductLikes.AsNoTracking()
            .Where(l => topProductIds.Contains(l.ProductId))
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var viewsLookup = viewCounts.ToDictionary(x => x.ProductId, x => x.Count);
        var likesLookup = likeCounts.ToDictionary(x => x.ProductId, x => x.Count);

        var topProducts = topProductsRaw
            .Select(p => new TopProductDto(
                p.ProductId,
                p.ProductName,
                p.QuantitySold,
                p.Revenue,
                viewsLookup.GetValueOrDefault(p.ProductId),
                likesLookup.GetValueOrDefault(p.ProductId)))
            .ToList();

        var topViewedRaw = await _db.ProductViews.AsNoTracking()
            .GroupBy(v => v.ProductId)
            .Select(g => new { ProductId = g.Key, Views = g.Count() })
            .OrderByDescending(x => x.Views)
            .Take(10)
            .ToListAsync(cancellationToken);

        var viewedIds = topViewedRaw.Select(x => x.ProductId).ToList();
        var viewedProducts = await _db.Products.AsNoTracking()
            .Where(p => viewedIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Name })
            .ToListAsync(cancellationToken);
        var nameLookup = viewedProducts.ToDictionary(x => x.Id, x => x.Name);

        var topViewedSales = await (
                from oi in _db.OrderItems.AsNoTracking()
                join o in _db.Orders.AsNoTracking() on oi.OrderId equals o.Id
                where paidStatuses.Contains(o.Status) && viewedIds.Contains(oi.ProductId)
                group oi by oi.ProductId
                into g
                select new
                {
                    ProductId = g.Key,
                    QuantitySold = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.LineTotal)
                })
            .ToListAsync(cancellationToken);
        var salesLookup = topViewedSales.ToDictionary(x => x.ProductId, x => x);

        var viewedLikes = await _db.ProductLikes.AsNoTracking()
            .Where(l => viewedIds.Contains(l.ProductId))
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);
        var viewedLikesLookup = viewedLikes.ToDictionary(x => x.ProductId, x => x.Count);

        var topViewedProducts = topViewedRaw
            .Select(v =>
            {
                salesLookup.TryGetValue(v.ProductId, out var sales);
                return new TopProductDto(
                    v.ProductId,
                    nameLookup.GetValueOrDefault(v.ProductId, "محصول حذف‌شده"),
                    sales?.QuantitySold ?? 0,
                    sales?.Revenue ?? 0,
                    v.Views,
                    viewedLikesLookup.GetValueOrDefault(v.ProductId));
            })
            .ToList();

        return new DashboardReportDto(
            userCount,
            orderCount,
            totalSales,
            todaySales,
            yesterdaySales,
            weekSales,
            monthSales,
            averageOrderValue,
            todayOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            returnedOrders,
            productCount,
            lowStockProducts,
            openTickets,
            todayViews,
            totalViews,
            totalLikes,
            totalComments,
            newUsersToday,
            newUsersMonth,
            conversionRate,
            last30Days,
            ordersByStatus,
            topProducts,
            topViewedProducts);
    }
}
