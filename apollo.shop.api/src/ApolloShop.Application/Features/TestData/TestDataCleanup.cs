using ApolloShop.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.TestData;

internal static class TestDataCleanup
{
    public static async Task<TestDataClearResult> ClearAsync(
        IApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var marker = TestDataConstants.CreatedByMarker;

        var products = await db.ProductsIncludingDeleted
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Specs)
            .ThenInclude(s => s.Values)
            .Where(p => p.CreatedBy == marker)
            .ToListAsync(cancellationToken);

        var productCount = products.Count;
        if (products.Count > 0)
        {
            var productIds = products.Select(p => p.Id).ToList();
            var variantIds = products.SelectMany(p => p.Variants).Select(v => v.Id).ToList();

            await db.CartItems
                .Where(c => variantIds.Contains(c.ProductVariantId))
                .ExecuteDeleteAsync(cancellationToken);
            await db.OrderItems
                .Where(o => productIds.Contains(o.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await db.ProductViews
                .Where(v => productIds.Contains(v.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await db.ProductLikes
                .Where(v => productIds.Contains(v.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await db.ProductComments
                .Where(v => productIds.Contains(v.ProductId))
                .ExecuteDeleteAsync(cancellationToken);

            db.Products.RemoveRange(products);
            await db.SaveChangesAsync(cancellationToken);
        }

        var blogPosts = await db.BlogPostsIncludingDeleted
            .Include(p => p.PostTags)
            .Where(p => p.CreatedBy == marker)
            .ToListAsync(cancellationToken);

        var blogCount = blogPosts.Count;
        if (blogPosts.Count > 0)
        {
            db.BlogPosts.RemoveRange(blogPosts);
            await db.SaveChangesAsync(cancellationToken);
        }

        var blogCategories = await db.BlogCategories
            .Where(c => c.CreatedBy == marker)
            .ToListAsync(cancellationToken);
        if (blogCategories.Count > 0)
        {
            db.BlogCategories.RemoveRange(blogCategories);
            await db.SaveChangesAsync(cancellationToken);
        }

        await db.BlogTags
            .Where(t => t.Slug.StartsWith(TestDataConstants.SlugPrefix))
            .ExecuteDeleteAsync(cancellationToken);

        var categories = await db.Categories
            .Where(c => c.CreatedBy == marker)
            .ToListAsync(cancellationToken);
        var categoryCount = categories.Count;
        if (categories.Count > 0)
        {
            db.Categories.RemoveRange(categories);
            await db.SaveChangesAsync(cancellationToken);
        }

        var brands = await db.Brands
            .Where(b => b.CreatedBy == marker)
            .ToListAsync(cancellationToken);
        var brandCount = brands.Count;
        if (brands.Count > 0)
        {
            db.Brands.RemoveRange(brands);
            await db.SaveChangesAsync(cancellationToken);
        }

        return new TestDataClearResult(productCount, brandCount, categoryCount, blogCount);
    }
}

public sealed record TestDataClearResult(
    int ProductsRemoved,
    int BrandsRemoved,
    int CategoriesRemoved,
    int BlogPostsRemoved);
