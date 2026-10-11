using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Common.Models;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Queries;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? CategorySlug = null,
    string? Brand = null,
    string? Search = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? Sort = null,
    bool Admin = false) : IRequest<PagedResult<ProductListItemDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductListItemDto>>
{
    private static readonly OrderStatus[] PaidStatuses =
    [
        OrderStatus.Paid,
        OrderStatus.Processing,
        OrderStatus.Shipped,
        OrderStatus.Delivered
    ];

    private readonly IApplicationDbContext _db;

    public GetProductsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<ProductListItemDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        if (!request.Admin)
        {
            // Published products stay visible even when unavailable for purchase.
            query = query.Where(p => p.Status == ProductStatus.Published);
        }

        if (!string.IsNullOrWhiteSpace(request.CategorySlug))
        {
            var slug = request.CategorySlug.Trim().ToLower();
            query = query.Where(p => p.Category != null && p.Category.Slug == slug);
        }

        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            var brand = request.Brand.Trim().ToLower();
            query = query.Where(p => p.Brand != null && (p.Brand.Slug == brand || p.Brand.Name.ToLower() == brand));
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s) ||
                p.Slug.ToLower().Contains(s) ||
                p.ProductCode.Contains(s) ||
                (p.Sku != null && p.Sku.ToLower().Contains(s)));
        }

        if (request.MinPrice is not null)
        {
            query = query.Where(p => p.BasePrice >= request.MinPrice);
        }

        if (request.MaxPrice is not null)
        {
            query = query.Where(p => p.BasePrice <= request.MaxPrice);
        }

        query = (request.Sort?.ToLowerInvariant()) switch
        {
            "price" or "price_asc" or "cheapest" => query.OrderBy(p => p.DiscountPrice ?? p.BasePrice),
            "price_desc" or "expensive" => query.OrderByDescending(p => p.DiscountPrice ?? p.BasePrice),
            "name" => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAtUtc),
            "most_viewed" => query.OrderByDescending(p => _db.ProductViews.Count(v => v.ProductId == p.Id))
                .ThenByDescending(p => p.CreatedAtUtc),
            "best_selling" => query.OrderByDescending(p =>
                    _db.OrderItems.Where(oi => oi.ProductId == p.Id && PaidStatuses.Contains(oi.Order.Status))
                        .Sum(oi => (int?)oi.Quantity) ?? 0)
                .ThenByDescending(p => p.CreatedAtUtc),
            "featured" => query.OrderByDescending(p => p.DiscountPrice != null)
                .ThenByDescending(p => p.CreatedAtUtc),
            "buyer_suggestion" => query.OrderByDescending(p =>
                    _db.ProductLikes.Count(l => l.ProductId == p.Id))
                .ThenByDescending(p => p.CreatedAtUtc),
            "fastest_shipping" => query.OrderByDescending(p => p.IsAvailable)
                .ThenByDescending(p => p.CreatedAtUtc),
            // مرتبط‌ترین / پیش‌فرض
            _ => query.OrderByDescending(p => p.CreatedAtUtc)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemDto(
                p.Id,
                p.Name,
                p.Slug,
                p.ProductCode,
                p.Sku,
                p.BasePrice,
                p.DiscountPrice,
                p.Status,
                p.IsAvailable,
                p.Brand != null ? p.Brand.Name : null,
                p.Category != null ? p.Category.Name : null,
                p.Images.Where(i => i.IsPrimary && i.MediaKind == ProductMediaKind.Image)
                        .Select(i => i.ImagePath).FirstOrDefault()
                    ?? p.Images.Where(i => i.MediaKind == ProductMediaKind.Image)
                        .OrderBy(i => i.SortOrder).Select(i => i.ImagePath).FirstOrDefault(),
                p.StockQuantity))
            .ToListAsync(cancellationToken);

        if (request.Admin && items.Count > 0)
        {
            items = await AttachSalesStatsAsync(items, cancellationToken);
        }

        return PagedResult<ProductListItemDto>.Create(items, page, pageSize, total);
    }

    private async Task<List<ProductListItemDto>> AttachSalesStatsAsync(
        List<ProductListItemDto> items,
        CancellationToken cancellationToken)
    {
        var productIds = items.Select(i => i.Id).ToList();
        const int trendWeeks = 12;
        var trendFrom = DateTime.UtcNow.Date.AddDays(-(trendWeeks * 7 - 1));

        var salesRows = await (
                from oi in _db.OrderItems.AsNoTracking()
                join o in _db.Orders.AsNoTracking() on oi.OrderId equals o.Id
                where productIds.Contains(oi.ProductId) && PaidStatuses.Contains(o.Status)
                select new
                {
                    oi.ProductId,
                    oi.Quantity,
                    oi.LineTotal,
                    PaidAt = o.PaidAtUtc
                })
            .ToListAsync(cancellationToken);

        var totals = salesRows
            .GroupBy(x => x.ProductId)
            .ToDictionary(
                g => g.Key,
                g => (
                    Units: g.Sum(x => x.Quantity),
                    Revenue: g.Sum(x => x.LineTotal)));

        var weekBuckets = salesRows
            .Where(x => x.PaidAt != null && x.PaidAt.Value.Date >= trendFrom)
            .GroupBy(x => x.ProductId)
            .ToDictionary(
                g => g.Key,
                g => g.GroupBy(x => WeekIndex(x.PaidAt!.Value.Date, trendFrom, trendWeeks))
                    .ToDictionary(w => w.Key, w => w.Sum(x => x.LineTotal)));

        return items.Select(item =>
        {
            totals.TryGetValue(item.Id, out var stats);
            weekBuckets.TryGetValue(item.Id, out var weeks);
            var trend = new decimal[trendWeeks];
            if (weeks is not null)
            {
                for (var i = 0; i < trendWeeks; i++)
                {
                    if (weeks.TryGetValue(i, out var revenue))
                    {
                        trend[i] = revenue;
                    }
                }
            }

            return item with
            {
                TotalSales = stats.Units,
                TotalRevenue = stats.Revenue,
                RevenueTrend = trend
            };
        }).ToList();
    }

    private static int WeekIndex(DateTime day, DateTime from, int weekCount)
    {
        var days = (day.Date - from.Date).Days;
        if (days < 0)
        {
            return 0;
        }

        return Math.Clamp(days / 7, 0, weekCount - 1);
    }
}
