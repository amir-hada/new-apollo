using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Entities.Content;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Support;
using ApolloShop.Domain.Enums;
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

        var brands = CreateBrands(now);
        var categories = CreateCategories(now);
        var products = CreateProducts(now, brands, categories);
        var blogCategory = new BlogCategory
        {
            Id = Guid.Parse("a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1"),
            Name = "اخبار فروشگاه",
            Slug = "store-news",
            Description = "آخرین اخبار و مقالات آپولو شاپ",
            CreatedAtUtc = now,
            CreatedBy = "system"
        };
        var blogTag = new BlogTag
        {
            Id = Guid.Parse("b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2"),
            Name = "راهنما",
            Slug = "guide"
        };
        var blogPost = new BlogPost
        {
            Id = Guid.Parse("c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3"),
            Slug = "welcome-to-apollo-shop",
            Title = "به فروشگاه آپولو خوش آمدید",
            Body = "فروشگاه آپولو با تمرکز بر کیفیت و تجربه خرید بهتر راه‌اندازی شده است.",
            Excerpt = "معرفی فروشگاه آپولو",
            FeaturedImageUrl = "/images/blog/welcome.jpg",
            SeoTitle = "فروشگاه آپولو | معرفی",
            SeoDescription = "آشنایی با فروشگاه اینترنتی آپولو",
            Status = BlogPostStatus.Published,
            PublishedAtUtc = now,
            AuthorUserId = adminUserId,
            CategoryId = blogCategory.Id,
            CreatedAtUtc = now,
            CreatedBy = "system"
        };
        var blogPostTag = new BlogPostTag { PostId = blogPost.Id, TagId = blogTag.Id };

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
        await context.Brands.AddRangeAsync(brands, cancellationToken);
        await context.Categories.AddRangeAsync(categories, cancellationToken);
        await context.Products.AddRangeAsync(products, cancellationToken);
        await context.BlogCategories.AddAsync(blogCategory, cancellationToken);
        await context.BlogTags.AddAsync(blogTag, cancellationToken);
        await context.BlogPosts.AddAsync(blogPost, cancellationToken);
        await context.BlogPostTags.AddAsync(blogPostTag, cancellationToken);
        await context.TicketCategories.AddRangeAsync(ticketCategories, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
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

    private static List<Brand> CreateBrands(DateTime now) =>
    [
        new Brand
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555501"),
            Name = "آپولو",
            Slug = "apollo",
            Description = "برند اختصاصی فروشگاه آپولو",
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = "system"
        },
        new Brand
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555502"),
            Name = "نئون",
            Slug = "neon",
            Description = "لوازم الکترونیکی",
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = "system"
        }
    ];

    private static List<Category> CreateCategories(DateTime now) =>
    [
        new Category
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666601"),
            Name = "الکترونیک",
            Slug = "electronics",
            Description = "محصولات الکترونیکی",
            SortOrder = 1,
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = "system"
        },
        new Category
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666602"),
            Name = "موبایل",
            Slug = "mobile",
            Description = "گوشی و لوازم جانبی",
            ParentId = Guid.Parse("66666666-6666-6666-6666-666666666601"),
            SortOrder = 1,
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = "system"
        },
        new Category
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666603"),
            Name = "لوازم خانگی",
            Slug = "home-appliances",
            Description = "وسایل منزل",
            SortOrder = 2,
            IsActive = true,
            CreatedAtUtc = now,
            CreatedBy = "system"
        }
    ];

    private static List<Product> CreateProducts(DateTime now, List<Brand> brands, List<Category> categories)
    {
        var apollo = brands[0].Id;
        var neon = brands[1].Id;
        var mobile = categories[1].Id;
        var home = categories[2].Id;
        var electronics = categories[0].Id;

        return
        [
            BuildProduct(
                productId: Guid.Parse("77777777-7777-7777-7777-777777777701"),
                variantId: Guid.Parse("88888888-8888-8888-8888-888888888801"),
                imageId: Guid.Parse("99999999-9999-9999-9999-999999999901"),
                specId: Guid.Parse("e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e101"),
                name: "هدفون بی‌سیم آپولو X1",
                slug: "apollo-x1-headphones",
                description: "هدفون بلوتوث با نویزکنسلینگ فعال و باتری ۳۰ ساعته.",
                brandId: apollo,
                price: 5_200_000m,
                discountPrice: 4_500_000m,
                categoryId: electronics,
                productCode: "0001",
                sku: "APL-HP-X1",
                stock: 40,
                imageUrl: "/images/products/apollo-x1.jpg",
                now: now),
            BuildProduct(
                productId: Guid.Parse("77777777-7777-7777-7777-777777777702"),
                variantId: Guid.Parse("88888888-8888-8888-8888-888888888802"),
                imageId: Guid.Parse("99999999-9999-9999-9999-999999999902"),
                specId: Guid.Parse("e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e102"),
                name: "شارژر سریع نئون ۶۵ وات",
                slug: "neon-65w-charger",
                description: "شارژر گالیم نیتراید با پشتیبانی از PD و QC.",
                brandId: neon,
                price: 1_100_000m,
                discountPrice: 890_000m,
                categoryId: mobile,
                productCode: "0002",
                sku: "NEON-CH-65",
                stock: 120,
                imageUrl: "/images/products/neon-charger.jpg",
                now: now),
            BuildProduct(
                productId: Guid.Parse("77777777-7777-7777-7777-777777777703"),
                variantId: Guid.Parse("88888888-8888-8888-8888-888888888803"),
                imageId: Guid.Parse("99999999-9999-9999-9999-999999999903"),
                specId: Guid.Parse("e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e103"),
                name: "اسپیکر پرتابل آپولو S2",
                slug: "apollo-s2-speaker",
                description: "اسپیکر ضدآب با صدای استریو و میکروفون داخلی.",
                brandId: apollo,
                price: 2_750_000m,
                discountPrice: null,
                categoryId: electronics,
                productCode: "0003",
                sku: "APL-SP-S2",
                stock: 55,
                imageUrl: "/images/products/apollo-s2.jpg",
                now: now),
            BuildProduct(
                productId: Guid.Parse("77777777-7777-7777-7777-777777777704"),
                variantId: Guid.Parse("88888888-8888-8888-8888-888888888804"),
                imageId: Guid.Parse("99999999-9999-9999-9999-999999999904"),
                specId: Guid.Parse("e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e104"),
                name: "جاروبرقی رباتیک نئون R3",
                slug: "neon-r3-robot-vacuum",
                description: "جاروبرقی هوشمند با نقشه‌برداری لیزری و کنترل از طریق اپلیکیشن.",
                brandId: neon,
                price: 21_500_000m,
                discountPrice: 18_900_000m,
                categoryId: home,
                productCode: "0004",
                sku: "NEON-RV-R3",
                stock: 15,
                imageUrl: "/images/products/neon-r3.jpg",
                now: now)
        ];
    }

    private static Product BuildProduct(
        Guid productId,
        Guid variantId,
        Guid imageId,
        Guid specId,
        string name,
        string slug,
        string description,
        Guid brandId,
        decimal price,
        decimal? discountPrice,
        Guid categoryId,
        string productCode,
        string sku,
        int stock,
        string imageUrl,
        DateTime now)
    {
        var sellingPrice = discountPrice ?? price;
        return new Product
        {
            Id = productId,
            Name = name,
            Slug = slug,
            Description = description,
            BrandId = brandId,
            CategoryId = categoryId,
            IsAvailable = true,
            Status = ProductStatus.Published,
            ProductCode = productCode,
            Sku = sku,
            BasePrice = price,
            DiscountPrice = discountPrice,
            StockQuantity = stock,
            TrackInventory = true,
            ShowStockInStore = false,
            StockDisplayThreshold = null,
            MinOrderQuantity = 1,
            CreatedAtUtc = now,
            CreatedBy = "system",
            Images =
            [
                new ProductImage
                {
                    Id = imageId,
                    ProductId = productId,
                    ImagePath = imageUrl,
                    AlternativeText = name,
                    SortOrder = 0,
                    IsPrimary = true
                }
            ],
            Variants =
            [
                new ProductVariant
                {
                    Id = variantId,
                    ProductId = productId,
                    Sku = sku,
                    Name = "پیش‌فرض",
                    Price = sellingPrice,
                    CompareAtPrice = discountPrice.HasValue ? price : null,
                    StockQuantity = stock,
                    IsActive = true
                }
            ],
            Specs =
            [
                new ProductSpecification
                {
                    Id = specId,
                    ProductId = productId,
                    Name = "گارانتی",
                    IsOrderParameter = false,
                    SortOrder = 1,
                    Values =
                    [
                        new ProductSpecificationValue
                        {
                            Id = Guid.NewGuid(),
                            SpecificationId = specId,
                            Value = "۱۸ ماه",
                            PriceAdjustment = 0,
                            SortOrder = 1
                        }
                    ]
                }
            ]
        };
    }
}
