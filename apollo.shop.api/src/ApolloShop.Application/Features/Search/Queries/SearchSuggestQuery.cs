using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Search.DTOs;
using ApolloShop.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Search.Queries;

public record SearchSuggestQuery(string? Query, int Limit = 6) : IRequest<SearchSuggestDto>;

public class SearchSuggestQueryHandler : IRequestHandler<SearchSuggestQuery, SearchSuggestDto>
{
    private readonly IApplicationDbContext _db;

    public SearchSuggestQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<SearchSuggestDto> Handle(SearchSuggestQuery request, CancellationToken cancellationToken)
    {
        var q = (request.Query ?? string.Empty).Trim();
        if (q.Length < 2)
        {
            return new SearchSuggestDto(q, [], [], []);
        }

        var limit = Math.Clamp(request.Limit, 1, 12);
        var s = q.ToLowerInvariant();

        // DbContext is not thread-safe — run suggest queries sequentially (each is tiny Take).
        var products = await _db.Products
            .AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published)
            .Where(p =>
                p.Name.ToLower().Contains(s) ||
                p.Slug.ToLower().Contains(s) ||
                p.ProductCode.Contains(s) ||
                (p.Sku != null && p.Sku.ToLower().Contains(s)) ||
                (p.Brand != null && p.Brand.Name.ToLower().Contains(s)) ||
                (p.Category != null && p.Category.Name.ToLower().Contains(s)))
            .OrderByDescending(p => p.Name.ToLower().StartsWith(s))
            .ThenByDescending(p => p.Brand != null && p.Brand.Name.ToLower().StartsWith(s))
            .ThenBy(p => p.Name)
            .Take(limit)
            .Select(p => new SearchSuggestProductDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Brand != null ? p.Brand.Name : null,
                p.Category != null ? p.Category.Name : null,
                p.DiscountPrice ?? p.BasePrice,
                p.Images.Where(i => i.IsPrimary && i.MediaKind == ProductMediaKind.Image)
                        .Select(i => i.ImagePath).FirstOrDefault()
                    ?? p.Images.Where(i => i.MediaKind == ProductMediaKind.Image)
                        .OrderBy(i => i.SortOrder).Select(i => i.ImagePath).FirstOrDefault()))
            .ToListAsync(cancellationToken);

        var brands = await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive)
            .Where(b => b.Name.ToLower().Contains(s) || b.Slug.ToLower().Contains(s))
            .OrderByDescending(b => b.Name.ToLower().StartsWith(s))
            .ThenBy(b => b.Name)
            .Take(limit)
            .Select(b => new SearchSuggestBrandDto(b.Id, b.Name, b.Slug, b.ImagePath))
            .ToListAsync(cancellationToken);

        var categories = await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .Where(c => c.Name.ToLower().Contains(s) || c.Slug.ToLower().Contains(s))
            .OrderByDescending(c => c.Name.ToLower().StartsWith(s))
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Take(limit)
            .Select(c => new SearchSuggestCategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Parent != null ? c.Parent.Name : null))
            .ToListAsync(cancellationToken);

        return new SearchSuggestDto(q, products, brands, categories);
    }
}
