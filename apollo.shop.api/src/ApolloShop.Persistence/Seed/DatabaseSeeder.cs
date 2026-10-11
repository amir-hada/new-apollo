using ApolloShop.Domain.Entities.Content;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Support;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Persistence.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync(cancellationToken);
        }
        else
        {
            await context.Database.EnsureCreatedAsync(cancellationToken);
        }

        await RemoveLegacyDemoCatalogAsync(context, cancellationToken);

        if (!await context.ShopSettings.AnyAsync(cancellationToken))
        {
            context.ShopSettings.Add(new ShopSettings
            {
                Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                ShopTitle = "فروشگاه آپولو",
                BrowserTitle = "فروشگاه آپولو | ApolloShop",
                Currency = "تومان",
                Description = "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.",
                MetaDescription = "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.",
                PrimaryColor = "#0f172a",
                CreatedAtUtc = DateTime.UtcNow,
                CreatedBy = "system"
            });
            await context.SaveChangesAsync(cancellationToken);
        }

        if (await context.Roles.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = DateTime.UtcNow;

        var adminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var customerRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var adminUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var permissions = CreatePermissions();
        var adminRole = new Role
        {
            Id = adminRoleId,
            Name = "Admin",
            NormalizedName = "ADMIN",
            Description = "Full system access"
        };
        var customerRole = new Role
        {
            Id = customerRoleId,
            Name = "Customer",
            NormalizedName = "CUSTOMER",
            Description = "Store customer"
        };

        var rolePermissions = permissions
            .Select(p => new RolePermission { RoleId = adminRoleId, PermissionId = p.Id })
            .ToList();

        var adminUser = new User
        {
            Id = adminUserId,
            Email = "admin@apolloshop.ir",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345"),
            FirstName = "مدیر",
            LastName = "آپولو",
            IsActive = true,
            EmailConfirmed = true,
            PhoneConfirmed = false,
            CreatedAtUtc = now,
            CreatedBy = "system"
        };

        var adminUserRole = new UserRole { UserId = adminUserId, RoleId = adminRoleId };

        var ticketCategories = new[]
        {
            new TicketCategory
            {
                Id = Guid.Parse("d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d401"),
                Name = "سفارشات",
                Description = "پیگیری و مشکلات سفارش"
            },
            new TicketCategory
            {
                Id = Guid.Parse("d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d402"),
                Name = "پرداخت",
                Description = "مسائل مربوط به پرداخت"
            },
            new TicketCategory
            {
                Id = Guid.Parse("d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d403"),
                Name = "فنی",
                Description = "مشکلات فنی وب‌سایت"
            }
        };

        await context.Permissions.AddRangeAsync(permissions, cancellationToken);
        await context.Roles.AddRangeAsync([adminRole, customerRole], cancellationToken);
        await context.RolePermissions.AddRangeAsync(rolePermissions, cancellationToken);
        await context.Users.AddAsync(adminUser, cancellationToken);
        await context.UserRoles.AddAsync(adminUserRole, cancellationToken);
        await context.TicketCategories.AddRangeAsync(ticketCategories, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Removes demo catalog/blog rows that older versions of the seeder inserted with fixed IDs.
    /// </summary>
    private static async Task RemoveLegacyDemoCatalogAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        Guid[] productIds =
        [
            Guid.Parse("77777777-7777-7777-7777-777777777701"),
            Guid.Parse("77777777-7777-7777-7777-777777777702"),
            Guid.Parse("77777777-7777-7777-7777-777777777703"),
            Guid.Parse("77777777-7777-7777-7777-777777777704")
        ];
        Guid[] categoryIds =
        [
            Guid.Parse("66666666-6666-6666-6666-666666666601"),
            Guid.Parse("66666666-6666-6666-6666-666666666602"),
            Guid.Parse("66666666-6666-6666-6666-666666666603")
        ];
        Guid[] brandIds =
        [
            Guid.Parse("55555555-5555-5555-5555-555555555501"),
            Guid.Parse("55555555-5555-5555-5555-555555555502")
        ];
        var blogPostId = Guid.Parse("c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3");
        var blogCategoryId = Guid.Parse("a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1");
        var blogTagId = Guid.Parse("b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2");

        var products = await context.Products
            .IgnoreQueryFilters()
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Specs)
            .ThenInclude(s => s.Values)
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (products.Count > 0)
        {
            var ids = products.Select(p => p.Id).ToList();
            var variantIds = products.SelectMany(p => p.Variants).Select(v => v.Id).ToList();

            await context.CartItems
                .Where(c => variantIds.Contains(c.ProductVariantId))
                .ExecuteDeleteAsync(cancellationToken);
            await context.OrderItems
                .Where(o => ids.Contains(o.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await context.ProductViews
                .Where(v => ids.Contains(v.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await context.ProductLikes
                .Where(v => ids.Contains(v.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await context.ProductComments
                .Where(v => ids.Contains(v.ProductId))
                .ExecuteDeleteAsync(cancellationToken);

            context.Products.RemoveRange(products);
            await context.SaveChangesAsync(cancellationToken);
        }

        await context.BlogPostTags
            .Where(t => t.PostId == blogPostId || t.TagId == blogTagId)
            .ExecuteDeleteAsync(cancellationToken);
        await context.BlogPosts
            .IgnoreQueryFilters()
            .Where(p => p.Id == blogPostId)
            .ExecuteDeleteAsync(cancellationToken);
        await context.BlogCategories
            .Where(c => c.Id == blogCategoryId)
            .ExecuteDeleteAsync(cancellationToken);
        await context.BlogTags
            .Where(t => t.Id == blogTagId)
            .ExecuteDeleteAsync(cancellationToken);

        // Child categories first (mobile under electronics).
        await context.Categories
            .Where(c => c.Id == categoryIds[1])
            .ExecuteDeleteAsync(cancellationToken);
        await context.Categories
            .Where(c => categoryIds.Contains(c.Id))
            .ExecuteDeleteAsync(cancellationToken);
        await context.Brands
            .Where(b => brandIds.Contains(b.Id))
            .ExecuteDeleteAsync(cancellationToken);
    }

    private static List<Permission> CreatePermissions()
    {
        var items = new (string Name, string Description, string Id)[]
        {
            ("admin.access", "Access admin panel", "44444444-4444-4444-4444-444444444401"),
            ("users.manage", "Manage users", "44444444-4444-4444-4444-444444444402"),
            ("products.manage", "Manage products", "44444444-4444-4444-4444-444444444403"),
            ("orders.manage", "Manage orders", "44444444-4444-4444-4444-444444444404"),
            ("tickets.manage", "Manage tickets", "44444444-4444-4444-4444-444444444405"),
            ("blog.manage", "Manage blog", "44444444-4444-4444-4444-444444444406"),
            ("reports.view", "View reports", "44444444-4444-4444-4444-444444444407")
        };

        return items.Select(x => new Permission
        {
            Id = Guid.Parse(x.Id),
            Name = x.Name,
            NormalizedName = x.Name.ToUpperInvariant(),
            Description = x.Description
        }).ToList();
    }
}
