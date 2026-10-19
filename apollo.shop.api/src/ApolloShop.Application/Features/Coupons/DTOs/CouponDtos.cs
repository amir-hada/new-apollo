namespace ApolloShop.Application.Features.Coupons.DTOs;

public record CouponDto(
    Guid Id,
    string Code,
    decimal? PercentOff,
    decimal? AmountOff,
    bool IsActive,
    DateTime? StartsAtUtc,
    DateTime? EndsAtUtc,
    int? MaxUses,
    int UsedCount);

public record UpsertCouponRequest(
    string Code,
    decimal? PercentOff,
    decimal? AmountOff,
    bool IsActive,
    DateTime? StartsAtUtc,
    DateTime? EndsAtUtc,
    int? MaxUses);

public record ValidateCouponRequest(string Code, decimal? Subtotal = null);

public record ValidateCouponResultDto(
    string Code,
    decimal DiscountAmount,
    decimal? PercentOff,
    decimal? AmountOff);
