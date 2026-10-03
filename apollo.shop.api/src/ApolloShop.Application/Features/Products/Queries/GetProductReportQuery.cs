using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Queries;

public record GetProductReportQuery(Guid ProductId, int Days = 30) : IRequest<ProductReportDto>;

public class GetProductReportQueryHandler : IRequestHandler<GetProductReportQuery, ProductReportDto>
{
    private static readonly OrderStatus[] PaidStatuses =
    [
        OrderStatus.Paid,
        OrderStatus.Processing,
        OrderStatus.Shipped,
        OrderStatus.Delivered
    ];

    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public GetProductReportQueryHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<ProductReportDto> Handle(GetProductReportQuery request, CancellationToken cancellationToken)
    {
        var days = Math.Clamp(request.Days, 7, 90);
        var product = await _db.Products.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Product", request.ProductId);

        var now = _clock.UtcNow.Date;
        var from = now.AddDays(-(days - 1));

        var orderRaw = await _db.OrderItems.AsNoTracking()
            .Where(oi => oi.ProductId == product.Id)
            .Join(
                _db.Orders.AsNoTracking(),
                oi => oi.OrderId,
                o => o.Id,
                (oi, o) => new { oi, o })
            .Where(x =>
                PaidStatuses.Contains(x.o.Status)
                && x.o.PaidAtUtc != null
                && x.o.PaidAtUtc >= from)
            .Select(x => new
            {
                PaidAt = x.o.PaidAtUtc!.Value,
                x.oi.Quantity,
                x.oi.LineTotal,
                x.oi.ProductVariantId,
                x.oi.Sku,
                OrderId = x.o.Id
            })
            .ToListAsync(cancellationToken);

        var orderRows = orderRaw
            .Select(x => new
            {
                Day = x.PaidAt.Date,
                x.Quantity,
                x.LineTotal,
                x.ProductVariantId,
                x.Sku,
                x.OrderId
            })
            .ToList();

        var returnedUnits = await _db.OrderItems.AsNoTracking()
            .Where(oi => oi.ProductId == product.Id)
            .Join(
                _db.Orders.AsNoTracking(),
                oi => oi.OrderId,
                o => o.Id,
                (oi, o) => new { oi, o })
            .Where(x =>
                x.o.Status == OrderStatus.Returned
                && (x.o.UpdatedAtUtc ?? x.o.CreatedAtUtc) >= from)
            .SumAsync(x => x.oi.Quantity, cancellationToken);

        var views = await _db.ProductViews.AsNoTracking()
            .Where(v => v.ProductId == product.Id && v.CreatedAtUtc >= from)
            .Select(v => new { Day = v.CreatedAtUtc, v.UserId, v.GuestToken })
            .ToListAsync(cancellationToken);

        var viewDays = views.Select(v => new { Date = v.Day.Date, v.UserId, v.GuestToken }).ToList();

        var likes = await _db.ProductLikes.AsNoTracking()
            .Where(l => l.ProductId == product.Id && l.CreatedAtUtc >= from)
            .Select(l => l.CreatedAtUtc)
            .ToListAsync(cancellationToken);
        var likeDays = likes.Select(d => d.Date).ToList();

        var comments = await _db.ProductComments.AsNoTracking()
            .Where(c => c.ProductId == product.Id && c.CreatedAtUtc >= from && c.IsApproved)
            .Select(c => new { c.CreatedAtUtc, c.Rating })
            .ToListAsync(cancellationToken);
        var commentDays = comments.Select(c => new { Date = c.CreatedAtUtc.Date, c.Rating }).ToList();

        var totalLikes = await _db.ProductLikes.AsNoTracking()
            .CountAsync(l => l.ProductId == product.Id, cancellationToken);
        var totalComments = await _db.ProductComments.AsNoTracking()
            .CountAsync(c => c.ProductId == product.Id && c.IsApproved, cancellationToken);
        var avgRating = await _db.ProductComments.AsNoTracking()
            .Where(c => c.ProductId == product.Id && c.IsApproved && c.Rating != null)
            .AverageAsync(c => (double?)c.Rating, cancellationToken);

        var cartQuantity = await (
                from ci in _db.CartItems.AsNoTracking()
                join v in _db.ProductVariants.AsNoTracking() on ci.ProductVariantId equals v.Id
                where v.ProductId == product.Id
                select (int?)ci.Quantity)
            .SumAsync(cancellationToken) ?? 0;

        var revenue = orderRows.Sum(x => x.LineTotal);
        var unitsSold = orderRows.Sum(x => x.Quantity);
        var orderCount = orderRows.Select(x => x.OrderId).Distinct().Count();
        var avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
        var viewCount = viewDays.Count;
        var uniqueViews = viewDays
            .Select(v => v.UserId?.ToString() ?? v.GuestToken ?? "anon")
            .Distinct()
            .Count();
        var conversion = viewCount > 0
            ? Math.Round((decimal)orderCount * 100m / viewCount, 2)
            : 0;

        var timeline = new List<ProductReportDayDto>(days);
        for (var i = 0; i < days; i++)
        {
            var day = from.AddDays(i);
            var dayOrders = orderRows.Where(x => x.Day == day).ToList();
            timeline.Add(new ProductReportDayDto(
                day.ToString("yyyy-MM-dd"),
                dayOrders.Sum(x => x.Quantity),
                dayOrders.Sum(x => x.LineTotal),
                viewDays.Count(v => v.Date == day),
                likeDays.Count(d => d == day),
                commentDays.Count(c => c.Date == day)));
        }

        var variantIds = orderRows.Select(x => x.ProductVariantId).Distinct().ToList();
        var variantNames = await _db.ProductVariants.AsNoTracking()
            .Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => v.Name, cancellationToken);

        var variantSales = orderRows
            .GroupBy(x => new { x.ProductVariantId, x.Sku })
            .Select(g => new ProductVariantSalesDto(
                g.Key.ProductVariantId,
                g.Key.Sku,
                variantNames.GetValueOrDefault(g.Key.ProductVariantId, "پیش‌فرض"),
                g.Sum(x => x.Quantity),
                g.Sum(x => x.LineTotal)))
            .OrderByDescending(x => x.UnitsSold)
            .ToList();

        return new ProductReportDto(
            product.Id,
            product.Name,
            days,
            revenue,
            unitsSold,
            orderCount,
            avgOrderValue,
            returnedUnits,
            viewCount,
            uniqueViews,
            totalLikes,
            totalComments,
            avgRating,
            cartQuantity,
            conversion,
            product.StockQuantity,
            product.TrackInventory,
            timeline,
            variantSales);
    }
}
