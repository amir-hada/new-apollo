using ApolloShop.Domain.Enums;

namespace ApolloShop.Application.Features.Blog.DTOs;

public record BlogPostListItemDto(Guid Id, string Slug, string Title, string? Excerpt, string? FeaturedImageUrl, BlogPostStatus Status, DateTime? PublishedAtUtc, string? CategoryName);
public record BlogPostDetailDto(
    Guid Id, string Slug, string Title, string Body, string? Excerpt, string? FeaturedImageUrl,
    string? SeoTitle, string? SeoDescription, BlogPostStatus Status, DateTime? PublishedAtUtc,
    Guid AuthorUserId, Guid? CategoryId, string? CategoryName, IReadOnlyList<string> Tags);

public record UpsertBlogPostRequest(
    string Slug, string Title, string Body, string? Excerpt, string? FeaturedImageUrl,
    string? SeoTitle, string? SeoDescription, Guid? CategoryId, IReadOnlyList<string>? Tags);

public record BlogCategoryDto(Guid Id, string Name, string Slug, string? Description);
public record UpsertBlogCategoryRequest(string Name, string Slug, string? Description);
public record BlogTagDto(Guid Id, string Name, string Slug);
public record UpsertBlogTagRequest(string Name, string Slug);
