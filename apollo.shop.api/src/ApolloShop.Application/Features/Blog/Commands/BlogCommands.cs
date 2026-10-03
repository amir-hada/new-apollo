using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Blog.DTOs;
using ApolloShop.Application.Features.Blog.Queries;
using ApolloShop.Domain.Entities.Content;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Blog.Commands;

public record CreateBlogPostCommand(UpsertBlogPostRequest Request) : IRequest<BlogPostDetailDto>;
public record UpdateBlogPostCommand(Guid Id, UpsertBlogPostRequest Request) : IRequest<BlogPostDetailDto>;
public record DeleteBlogPostCommand(Guid Id) : IRequest;
public record PublishBlogPostCommand(Guid Id) : IRequest<BlogPostDetailDto>;
public record CreateBlogCategoryCommand(UpsertBlogCategoryRequest Request) : IRequest<BlogCategoryDto>;
public record UpdateBlogCategoryCommand(Guid Id, UpsertBlogCategoryRequest Request) : IRequest<BlogCategoryDto>;
public record DeleteBlogCategoryCommand(Guid Id) : IRequest;
public record CreateBlogTagCommand(UpsertBlogTagRequest Request) : IRequest<BlogTagDto>;
public record UpdateBlogTagCommand(Guid Id, UpsertBlogTagRequest Request) : IRequest<BlogTagDto>;
public record DeleteBlogTagCommand(Guid Id) : IRequest;

public class CreateBlogPostCommandHandler : IRequestHandler<CreateBlogPostCommand, BlogPostDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;

    public CreateBlogPostCommandHandler(IApplicationDbContext db, ICurrentUser currentUser, IDateTimeProvider clock)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<BlogPostDetailDto> Handle(CreateBlogPostCommand request, CancellationToken cancellationToken)
    {
        var authorId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.BlogPosts.AnyAsync(p => p.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Blog post slug already exists.");
        }

        var post = new BlogPost
        {
            Id = Guid.NewGuid(),
            Slug = slug,
            Title = request.Request.Title.Trim(),
            Body = request.Request.Body,
            Excerpt = request.Request.Excerpt,
            FeaturedImageUrl = request.Request.FeaturedImageUrl,
            SeoTitle = request.Request.SeoTitle,
            SeoDescription = request.Request.SeoDescription,
            Status = BlogPostStatus.Draft,
            AuthorUserId = authorId,
            CategoryId = request.Request.CategoryId,
            CreatedAtUtc = _clock.UtcNow
        };

        _db.BlogPosts.Add(post);
        await BlogTagHelper.SyncTagsAsync(_db, post, request.Request.Tags, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await BlogMapper.LoadByIdAsync(_db, post.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", post.Id);
        return BlogMapper.ToDetail(loaded);
    }
}

public class UpdateBlogPostCommandHandler : IRequestHandler<UpdateBlogPostCommand, BlogPostDetailDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateBlogPostCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<BlogPostDetailDto> Handle(UpdateBlogPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts.Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", request.Id);

        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.BlogPosts.AnyAsync(p => p.Slug == slug && p.Id != post.Id, cancellationToken))
        {
            throw new ConflictException("Blog post slug already exists.");
        }

        post.Slug = slug;
        post.Title = request.Request.Title.Trim();
        post.Body = request.Request.Body;
        post.Excerpt = request.Request.Excerpt;
        post.FeaturedImageUrl = request.Request.FeaturedImageUrl;
        post.SeoTitle = request.Request.SeoTitle;
        post.SeoDescription = request.Request.SeoDescription;
        post.CategoryId = request.Request.CategoryId;

        _db.BlogPostTags.RemoveRange(post.PostTags);
        await BlogTagHelper.SyncTagsAsync(_db, post, request.Request.Tags, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await BlogMapper.LoadByIdAsync(_db, post.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", post.Id);
        return BlogMapper.ToDetail(loaded);
    }
}

public class DeleteBlogPostCommandHandler : IRequestHandler<DeleteBlogPostCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;
    private readonly ICurrentUser _currentUser;

    public DeleteBlogPostCommandHandler(IApplicationDbContext db, IDateTimeProvider clock, ICurrentUser currentUser)
    {
        _db = db;
        _clock = clock;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteBlogPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", request.Id);

        post.IsDeleted = true;
        post.DeletedAtUtc = _clock.UtcNow;
        post.DeletedBy = _currentUser.Email ?? _currentUser.UserId?.ToString();
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class PublishBlogPostCommandHandler : IRequestHandler<PublishBlogPostCommand, BlogPostDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public PublishBlogPostCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<BlogPostDetailDto> Handle(PublishBlogPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", request.Id);

        post.Status = BlogPostStatus.Published;
        post.PublishedAtUtc ??= _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await BlogMapper.LoadByIdAsync(_db, post.Id, cancellationToken)
            ?? throw new NotFoundException("BlogPost", post.Id);
        return BlogMapper.ToDetail(loaded);
    }
}

public class CreateBlogCategoryCommandHandler : IRequestHandler<CreateBlogCategoryCommand, BlogCategoryDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public CreateBlogCategoryCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<BlogCategoryDto> Handle(CreateBlogCategoryCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.BlogCategories.AnyAsync(c => c.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Blog category slug already exists.");
        }

        var entity = new BlogCategory
        {
            Id = Guid.NewGuid(),
            Name = request.Request.Name.Trim(),
            Slug = slug,
            Description = request.Request.Description,
            CreatedAtUtc = _clock.UtcNow
        };

        _db.BlogCategories.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new BlogCategoryDto(entity.Id, entity.Name, entity.Slug, entity.Description);
    }
}

public class UpdateBlogCategoryCommandHandler : IRequestHandler<UpdateBlogCategoryCommand, BlogCategoryDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateBlogCategoryCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<BlogCategoryDto> Handle(UpdateBlogCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.BlogCategories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogCategory", request.Id);

        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.BlogCategories.AnyAsync(c => c.Slug == slug && c.Id != entity.Id, cancellationToken))
        {
            throw new ConflictException("Blog category slug already exists.");
        }

        entity.Name = request.Request.Name.Trim();
        entity.Slug = slug;
        entity.Description = request.Request.Description;
        await _db.SaveChangesAsync(cancellationToken);
        return new BlogCategoryDto(entity.Id, entity.Name, entity.Slug, entity.Description);
    }
}

public class DeleteBlogCategoryCommandHandler : IRequestHandler<DeleteBlogCategoryCommand>
{
    private readonly IApplicationDbContext _db;

    public DeleteBlogCategoryCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(DeleteBlogCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.BlogCategories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogCategory", request.Id);

        if (await _db.BlogPosts.AnyAsync(p => p.CategoryId == entity.Id, cancellationToken))
        {
            throw new ConflictException("Blog category is in use.");
        }

        _db.BlogCategories.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class CreateBlogTagCommandHandler : IRequestHandler<CreateBlogTagCommand, BlogTagDto>
{
    private readonly IApplicationDbContext _db;

    public CreateBlogTagCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<BlogTagDto> Handle(CreateBlogTagCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.BlogTags.AnyAsync(t => t.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Blog tag slug already exists.");
        }

        var entity = new BlogTag { Id = Guid.NewGuid(), Name = request.Request.Name.Trim(), Slug = slug };
        _db.BlogTags.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new BlogTagDto(entity.Id, entity.Name, entity.Slug);
    }
}

public class UpdateBlogTagCommandHandler : IRequestHandler<UpdateBlogTagCommand, BlogTagDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateBlogTagCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<BlogTagDto> Handle(UpdateBlogTagCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.BlogTags.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogTag", request.Id);

        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.BlogTags.AnyAsync(t => t.Slug == slug && t.Id != entity.Id, cancellationToken))
        {
            throw new ConflictException("Blog tag slug already exists.");
        }

        entity.Name = request.Request.Name.Trim();
        entity.Slug = slug;
        await _db.SaveChangesAsync(cancellationToken);
        return new BlogTagDto(entity.Id, entity.Name, entity.Slug);
    }
}

public class DeleteBlogTagCommandHandler : IRequestHandler<DeleteBlogTagCommand>
{
    private readonly IApplicationDbContext _db;

    public DeleteBlogTagCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(DeleteBlogTagCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.BlogTags.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("BlogTag", request.Id);

        var links = await _db.BlogPostTags.Where(pt => pt.TagId == entity.Id).ToListAsync(cancellationToken);
        _db.BlogPostTags.RemoveRange(links);
        _db.BlogTags.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

internal static class BlogTagHelper
{
    public static async Task SyncTagsAsync(IApplicationDbContext db, BlogPost post, IReadOnlyList<string>? tags, CancellationToken cancellationToken)
    {
        if (tags is null || tags.Count == 0)
        {
            return;
        }

        foreach (var raw in tags.Select(t => t.Trim()).Where(t => t.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var slug = raw.ToLowerInvariant().Replace(' ', '-');
            var tag = await db.BlogTags.FirstOrDefaultAsync(t => t.Slug == slug, cancellationToken);
            if (tag is null)
            {
                tag = new BlogTag { Id = Guid.NewGuid(), Name = raw, Slug = slug };
                db.BlogTags.Add(tag);
            }

            db.BlogPostTags.Add(new BlogPostTag { PostId = post.Id, TagId = tag.Id });
        }
    }
}
