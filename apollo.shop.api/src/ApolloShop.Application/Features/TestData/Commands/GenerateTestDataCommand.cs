using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Entities.Content;
using ApolloShop.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using DomainValidationException = ApolloShop.Domain.Exceptions.ValidationException;

namespace ApolloShop.Application.Features.TestData.Commands;

public record GenerateTestDataCommand(string TopicKey) : IRequest<TestDataGenerateResult>;

public sealed record TestDataGenerateResult(
    string TopicKey,
    string TopicTitle,
    int BrandsCreated,
    int CategoriesCreated,
    int ProductsCreated,
    int BlogPostsCreated);

public sealed class GenerateTestDataCommandValidator : AbstractValidator<GenerateTestDataCommand>
{
    public GenerateTestDataCommandValidator()
    {
        RuleFor(x => x.TopicKey)
            .NotEmpty()
            .WithMessage("موضوع فروشگاه الزامی است.")
            .Must(key => TestDataCatalog.Find(key) is not null)
            .WithMessage("موضوع انتخاب‌شده معتبر نیست.");
    }
}

public sealed class GenerateTestDataCommandHandler : IRequestHandler<GenerateTestDataCommand, TestDataGenerateResult>
{
    private static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public GenerateTestDataCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<TestDataGenerateResult> Handle(
        GenerateTestDataCommand request,
        CancellationToken cancellationToken)
    {
        var topic = TestDataCatalog.Find(request.TopicKey)
            ?? throw new DomainValidationException("TopicKey", "موضوع انتخاب‌شده معتبر نیست.");

        if (topic.Brands.Count != 5
            || topic.Categories.Count != 5
            || topic.Products.Count != 20
            || topic.BlogTitles.Count != 5)
        {
            throw new InvalidOperationException("تعریف موضوع تستی ناقص است.");
        }

        await TestDataCleanup.ClearAsync(_db, cancellationToken);

        var now = _clock.UtcNow;
        var marker = TestDataConstants.CreatedByMarker;
        var prefix = $"{TestDataConstants.SlugPrefix}{topic.Key}";

        var brands = topic.Brands.Select((name, index) => new Brand
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = $"{prefix}-brand-{index + 1}",
            Description = $"برند تستی {name} در موضوع {topic.Title}",
            ImagePath = topic.ProductImages[index % topic.ProductImages.Count],
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = marker
        }).ToList();
        _db.Brands.AddRange(brands);

        var categories = topic.Categories.Select((name, index) => new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = $"{prefix}-cat-{index + 1}",
            Description = $"دسته‌بندی تستی {name}",
            SortOrder = index + 1,
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = marker
        }).ToList();
        _db.Categories.AddRange(categories);

        var authorId = await ResolveAuthorIdAsync(cancellationToken);

        var blogCategory = new BlogCategory
        {
            Id = Guid.NewGuid(),
            Name = $"بلاگ {topic.Title}",
            Slug = $"{prefix}-blog",
            Description = $"مقالات تستی حوزه {topic.Title}",
            CreatedAtUtc = now,
            CreatedBy = marker
        };
        _db.BlogCategories.Add(blogCategory);

        var blogTag = new BlogTag
        {
            Id = Guid.NewGuid(),
            Name = "تستی",
            Slug = $"{prefix}-tag"
        };
        _db.BlogTags.Add(blogTag);

        var blogPosts = topic.BlogTitles.Select((title, index) =>
        {
            var postId = Guid.NewGuid();
            return new BlogPost
            {
                Id = postId,
                Title = title,
                Slug = $"{prefix}-post-{index + 1}",
                Excerpt = $"{title} — محتوای نمونه برای دموی فروشگاه.",
                Body = $"<p>این یک مطلب تستی در موضوع <strong>{topic.Title}</strong> است.</p><p>{title}</p>",
                FeaturedImageUrl = topic.BlogImages[index % topic.BlogImages.Count],
                SeoTitle = title,
                SeoDescription = $"مقاله تستی: {title}",
                Status = BlogPostStatus.Published,
                PublishedAtUtc = now,
                AuthorUserId = authorId,
                CategoryId = blogCategory.Id,
                CreatedAtUtc = now,
                CreatedBy = marker,
                PostTags =
                [
                    new BlogPostTag { PostId = postId, TagId = blogTag.Id }
                ]
            };
        }).ToList();
        _db.BlogPosts.AddRange(blogPosts);

        var nextCode = await NextNumericProductCodeAsync(cancellationToken);
        var products = new List<Product>(topic.Products.Count);

        for (var i = 0; i < topic.Products.Count; i++)
        {
            var name = topic.Products[i];
            var category = categories[i % categories.Count];
            var brand = brands[i % brands.Count];
            var image = topic.ProductImages[i % topic.ProductImages.Count];
            var basePrice = 250_000m + (i * 175_000m);
            var hasDiscount = i % 3 != 0;
            var discount = hasDiscount ? Math.Round(basePrice * 0.88m, 0) : (decimal?)null;
            var stock = 10 + (i * 3);
            var productId = Guid.NewGuid();
            var code = (nextCode + i).ToString("D4");
            var slug = $"{prefix}-product-{i + 1}";
            var sku = $"TEST-{topic.Key.ToUpperInvariant()}-{(i + 1):D2}";

            var product = new Product
            {
                Id = productId,
                Name = name,
                Slug = slug,
                Description = $"{name} — محصول تستی برند «{brand.Name}» در دسته «{category.Name}» برای دموی فروشگاه {topic.Title}.",
                BrandId = brand.Id,
                CategoryId = category.Id,
                IsAvailable = true,
                Status = ProductStatus.Published,
                ProductCode = code,
                Sku = sku,
                BasePrice = basePrice,
                DiscountPrice = discount,
                StockQuantity = stock,
                TrackInventory = true,
                ShowStockInStore = true,
                StockDisplayThreshold = 5,
                MinOrderQuantity = 1,
                SeoTitle = name,
                SeoDescription = $"خرید {name} از فروشگاه تستی",
                FocusKeyword = name,
                OgTitle = name,
                OgImageUrl = image,
                CreatedAtUtc = now,
                CreatedBy = marker,
                Images =
                [
                    new ProductImage
                    {
                        Id = Guid.NewGuid(),
                        ProductId = productId,
                        ImagePath = image,
                        AlternativeText = name,
                        SortOrder = 0,
                        IsPrimary = true
                    }
                ],
                Variants =
                [
                    new ProductVariant
                    {
                        Id = Guid.NewGuid(),
                        ProductId = productId,
                        Sku = sku,
                        Name = "پیش‌فرض",
                        Price = discount ?? basePrice,
                        CompareAtPrice = discount.HasValue ? basePrice : null,
                        StockQuantity = stock,
                        IsActive = true
                    }
                ]
            };

            products.Add(product);
        }

        _db.Products.AddRange(products);
        await _db.SaveChangesAsync(cancellationToken);

        return new TestDataGenerateResult(
            topic.Key,
            topic.Title,
            brands.Count,
            categories.Count,
            products.Count,
            blogPosts.Count);
    }

    private async Task<Guid> ResolveAuthorIdAsync(CancellationToken cancellationToken)
    {
        var admin = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == AdminUserId, cancellationToken);
        if (admin is not null)
        {
            return admin.Id;
        }

        var any = await _db.Users.AsNoTracking().Select(u => u.Id).FirstOrDefaultAsync(cancellationToken);
        if (any == Guid.Empty)
        {
            throw new DomainValidationException("Author", "هیچ کاربری برای نویسنده بلاگ یافت نشد.");
        }

        return any;
    }

    private async Task<int> NextNumericProductCodeAsync(CancellationToken cancellationToken)
    {
        var codes = await _db.ProductsIncludingDeleted
            .Select(p => p.ProductCode)
            .ToListAsync(cancellationToken);

        var max = 0;
        foreach (var code in codes)
        {
            if (int.TryParse(code, out var n) && n > max)
            {
                max = n;
            }
        }

        return max + 1;
    }
}
