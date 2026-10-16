using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.ShopSettings;

public static class ShopIndustryCategorySync
{
    /// <summary>
    /// Ensures the tenant has the default categories for <paramref name="industryKey"/>.
    /// Only industry-template categories (<c>ind-*</c>) from other industries are deactivated.
    /// Custom categories created by the admin are left untouched so they can keep adding their own.
    /// </summary>
    public static async Task ApplyAsync(
        IApplicationDbContext db,
        Guid tenantId,
        string? industryKey,
        bool deactivateOthers,
        CancellationToken cancellationToken)
    {
        var key = ShopIndustryKeys.Normalize(industryKey) ?? ShopIndustryKeys.General;
        var templates = ShopIndustryCatalog.GetCategories(key);
        var targetSlugs = templates
            .Select(t => ShopIndustryCatalog.BuildSlug(key, t.Suffix))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existing = await db.Categories
            .Where(c => c.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        // Never wipe admin-created categories. Only retire foreign industry templates.
        foreach (var cat in existing.Where(c =>
                     c.IsActive
                     && ShopIndustryCatalog.IsIndustrySlug(c.Slug)
                     && !targetSlugs.Contains(c.Slug)))
        {
            cat.IsActive = false;
            cat.UpdatedAtUtc = now;
            cat.UpdatedBy = "industry-sync";
        }

        // Optional: when industry changes, also hide leftover seeded/test categories
        // that are not custom admin work (CreatedBy industry-sync / test marker / system-fix).
        if (deactivateOthers)
        {
            foreach (var cat in existing.Where(c =>
                         c.IsActive
                         && !targetSlugs.Contains(c.Slug)
                         && !ShopIndustryCatalog.IsIndustrySlug(c.Slug)
                         && IsSystemManaged(c.CreatedBy)))
            {
                cat.IsActive = false;
                cat.UpdatedAtUtc = now;
                cat.UpdatedBy = "industry-sync";
            }
        }

        var sort = 1;
        foreach (var template in templates)
        {
            var slug = ShopIndustryCatalog.BuildSlug(key, template.Suffix);
            var cat = existing.FirstOrDefault(c =>
                string.Equals(c.Slug, slug, StringComparison.OrdinalIgnoreCase));

            if (cat is null)
            {
                cat = new Category
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Name = template.Name,
                    Slug = slug,
                    Description = template.Description,
                    ParentId = null,
                    SortOrder = sort,
                    IsActive = true,
                    CreatedAtUtc = now,
                    CreatedBy = "industry-sync",
                };
                db.Categories.Add(cat);
                existing.Add(cat);
            }
            else
            {
                cat.Name = template.Name;
                cat.Description = template.Description;
                cat.SortOrder = sort;
                cat.IsActive = true;
                cat.ParentId = null;
                cat.UpdatedAtUtc = now;
                cat.UpdatedBy = "industry-sync";
            }

            sort++;
        }
    }

    private static bool IsSystemManaged(string? createdBy) =>
        string.Equals(createdBy, "industry-sync", StringComparison.OrdinalIgnoreCase)
        || string.Equals(createdBy, "system-fix-mobile", StringComparison.OrdinalIgnoreCase)
        || string.Equals(createdBy, "system", StringComparison.OrdinalIgnoreCase)
        || string.Equals(createdBy, "testdata", StringComparison.OrdinalIgnoreCase)
        || (!string.IsNullOrWhiteSpace(createdBy)
            && createdBy.StartsWith("test-", StringComparison.OrdinalIgnoreCase));
}
