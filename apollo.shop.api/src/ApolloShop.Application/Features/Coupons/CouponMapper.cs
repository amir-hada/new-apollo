using ApolloShop.Application.Features.Coupons.DTOs;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Exceptions;

namespace ApolloShop.Application.Features.Coupons;

internal static class CouponMapper
{
    public static CouponDto ToDto(Coupon c) =>
        new(c.Id, c.Code, c.PercentOff, c.AmountOff, c.IsActive, c.StartsAtUtc, c.EndsAtUtc, c.MaxUses, c.UsedCount);

    public static decimal ComputeDiscount(Coupon coupon, decimal subtotal)
    {
        if (subtotal <= 0)
        {
            return 0;
        }

        decimal discount = 0;
        if (coupon.PercentOff is decimal percent && percent > 0)
        {
            discount = Math.Round(subtotal * percent / 100m, 0, MidpointRounding.AwayFromZero);
        }
        else if (coupon.AmountOff is decimal amount && amount > 0)
        {
            discount = amount;
        }

        return Math.Clamp(discount, 0, subtotal);
    }

    public static void EnsureUsable(Coupon coupon, DateTime utcNow)
    {
        if (!coupon.IsActive)
        {
            throw new ValidationException("Coupon", "این کد تخفیف غیرفعال است.");
        }

        if (coupon.StartsAtUtc is DateTime start && utcNow < start)
        {
            throw new ValidationException("Coupon", "این کد تخفیف هنوز فعال نشده است.");
        }

        if (coupon.EndsAtUtc is DateTime end && utcNow > end)
        {
            throw new ValidationException("Coupon", "مهلت استفاده از این کد تخفیف به پایان رسیده است.");
        }

        if (coupon.MaxUses is int max && max > 0 && coupon.UsedCount >= max)
        {
            throw new ValidationException("Coupon", "سقف استفاده از این کد تخفیف تکمیل شده است.");
        }
    }

    public static string NormalizeCode(string? code) =>
        (code ?? string.Empty).Trim().ToUpperInvariant();
}
