using Apollo.Domain.Constants;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Apollo.Infrastructure.Persistence;

public static class PlanDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("PlanDataSeeder");

        if (await db.Plans.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;

        var starterId = Guid.Parse("a1000001-0000-4000-8000-000000000001");
        var growthId = Guid.Parse("a1000001-0000-4000-8000-000000000002");
        var proId = Guid.Parse("a1000001-0000-4000-8000-000000000003");

        db.Plans.AddRange(
            new Plan
            {
                Id = starterId,
                Name = "استارتر",
                Description = "برای شروع فروش آنلاین با دامنهٔ زیرمجموعه و امکانات پایه.",
                PriceInToman = 0,
                DiscountedPriceInToman = null,
                IsAvailable = true,
                AllowsInstallment = false,
                IsPublished = true,
                BillingPeriod = PlanBillingPeriod.Monthly,
                ProductType = PlanProductType.Shop,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
                Properties =
                [
                    new PlanProperty
                    {
                        Id = Guid.NewGuid(),
                        PlanId = starterId,
                        Title = "محصولات",
                        Value = "تا ۵۰ محصول",
                        SortOrder = 0,
                    },
                    new PlanProperty
                    {
                        Id = Guid.NewGuid(),
                        PlanId = starterId,
                        Title = "دامنه",
                        Value = "زیرمجموعه رایگان",
                        SortOrder = 1,
                    },
                ],
            },
            new Plan
            {
                Id = growthId,
                Name = "رشد",
                Description = "برای فروشگاه‌های در حال رشد با پشتیبانی بهتر و ظرفیت بیشتر.",
                PriceInToman = 490_000,
                DiscountedPriceInToman = 390_000,
                IsAvailable = true,
                AllowsInstallment = true,
                IsPublished = true,
                BillingPeriod = PlanBillingPeriod.Monthly,
                ProductType = PlanProductType.Shop,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
                Properties =
                [
                    new PlanProperty
                    {
                        Id = Guid.NewGuid(),
                        PlanId = growthId,
                        Title = "محصولات",
                        Value = "تا ۵۰۰ محصول",
                        SortOrder = 0,
                    },
                    new PlanProperty
                    {
                        Id = Guid.NewGuid(),
                        PlanId = growthId,
                        Title = "پشتیبانی",
                        Value = "اولویت‌دار",
                        SortOrder = 1,
                    },
                ],
            },
            new Plan
            {
                Id = proId,
                Name = "حرفه‌ای",
                Description = "برای کسب‌وکارهای جدی با ظرفیت نامحدود و دامنه اختصاصی.",
                PriceInToman = 990_000,
                DiscountedPriceInToman = null,
                IsAvailable = true,
                AllowsInstallment = true,
                IsPublished = true,
                BillingPeriod = PlanBillingPeriod.Monthly,
                ProductType = PlanProductType.Shop,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
                Properties =
                [
                    new PlanProperty
                    {
                        Id = Guid.NewGuid(),
                        PlanId = proId,
                        Title = "محصولات",
                        Value = "نامحدود",
                        SortOrder = 0,
                    },
                    new PlanProperty
                    {
                        Id = Guid.NewGuid(),
                        PlanId = proId,
                        Title = "دامنه",
                        Value = "اختصاصی",
                        SortOrder = 1,
                    },
                ],
            });

        await db.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} default Shop plans.", 3);
    }
}
