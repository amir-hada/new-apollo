using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Common.Models;
using ApolloShop.Application.Features.Blog.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Blog.Queries;

public record GetBlogPostsQuery(int Page = 1, int PageSize = 20, string? Search = null, bool Admin = false) : IRequest<PagedResult<BlogPostListItemDto>>;
public record GetBlogPostBySlugQuery(string Slug) : IRequest<BlogPostDetailDto>;
public record GetBlogPostByIdQuery(Guid Id) : IRequest<BlogPostDetailDto>;
public record GetBlogCategoriesQuery : IRequest<IReadOnlyList<BlogCategoryDto>>;
public record GetBlogTagsQuery : IRequest<IReadOnlyList<BlogTagDto>>;

public class GetBlogPostsQueryHandler : IRequestHandler<GetBlogPostsQuery, PagedResult<BlogPostListItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetBlogPostsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<BlogPostListItemDto>> Handle(GetBlogPostsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _db.BlogPosts.AsNoTracking().Include(p => p.Category).AsQueryable();

        if (!request.Admin)
        {
            query = query.Where(p => p.Status == BlogPostStatus.Published);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(s) || p.Slug.ToLower().Contains(s));
        }

        query = query.OrderByDescending(p => p.PublishedAtUtc ?? p.CreatedAtUtc);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new BlogPostListItemDto(p.Id, p.Slug, p.Title, p.Excerpt, p.FeaturedImageUrl, p.Status, p.PublishedAtUtc, p.Category != null ? p.Category.Name : null))
            .ToListAsync(cancellationToken);

        return PagedResult<BlogPostListItemDto>.Create(items, page, pageSize, total);
    }
}

public class GetBlogPostBySlugQueryHandler : IRequestHandler<GetBlogPostBySlugQuery, BlogPostDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetBlogPostBySlugQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<BlogPostDetailDto> Handle(GetBlogPostBySlugQuery request, CancellationToken cancellationToken)
    {
        var post = await BlogMapper.LoadBySlugAsync(_db, request.Slug, cancellationToken)
            ?? throw new NotFoundException("BlogPost", request.Slug);

        if (post.Status != BlogPostStatus.Published)
        {
            throw new NotFoundException("BlogPost", request.Slug);
        }

        return BlogMapper.ToDetail(post);
    }
}

public class GetBlogPostByIdQueryHandler : IRequestHandler<GetBlogPostByIdQuery, BlogPostDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetBlogPostByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<BlogPostDetailDto> Handle(GetBlogPostByIdQuery request, CancellationToken cancellationToken)
    {
        var post = await BlogMapper.LoadByIdAsync(_db, request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", request.Id);
        return BlogMapper.ToDetail(post);
    }
}

public class GetBlogCategoriesQueryHandler : IRequestHandler<GetBlogCategoriesQuery, IReadOnlyList<BlogCategoryDto>>
{
    private readonly IApplicationDbContext _db;

    public GetBlogCategoriesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<BlogCategoryDto>> Handle(GetBlogCategoriesQuery request, CancellationToken cancellationToken) =>
        await _db.BlogCategories.AsNoTracking().OrderBy(c => c.Name)
            .Select(c => new BlogCategoryDto(c.Id, c.Name, c.Slug, c.Description))
            .ToListAsync(cancellationToken);
}

public class GetBlogTagsQueryHandler : IRequestHandler<GetBlogTagsQuery, IReadOnlyList<BlogTagDto>>
{
    private readonly IApplicationDbContext _db;

    public GetBlogTagsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<BlogTagDto>> Handle(GetBlogTagsQuery request, CancellationToken cancellationToken) =>
        await _db.BlogTags.AsNoTracking().OrderBy(t => t.Name)
            .Select(t => new BlogTagDto(t.Id, t.Name, t.Slug))
            .ToListAsync(cancellationToken);
}

internal static class BlogMapper
{
    public static async Task<ApolloShop.Domain.Entities.Content.BlogPost?> LoadBySlugAsync(IApplicationDbContext db, string slug, CancellationToken ct) =>
        await db.BlogPosts.AsNoTracking().Include(p => p.Category).Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public static async Task<ApolloShop.Domain.Entities.Content.BlogPost?> LoadByIdAsync(IApplicationDbContext db, Guid id, CancellationToken ct) =>
        await db.BlogPosts.AsNoTracking().Include(p => p.Category).Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public static BlogPostDetailDto ToDetail(ApolloShop.Domain.Entities.Content.BlogPost p) =>
        new(p.Id, p.Slug, p.Title, p.Body, p.Excerpt, p.FeaturedImageUrl, p.SeoTitle, p.SeoDescription,
            p.Status, p.PublishedAtUtc, p.AuthorUserId, p.CategoryId, p.Category?.Name,
            p.PostTags.Select(pt => pt.Tag.Name).ToList());
}
