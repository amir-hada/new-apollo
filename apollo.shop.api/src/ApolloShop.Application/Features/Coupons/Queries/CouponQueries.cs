using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Coupons.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Coupons.Queries;

public record GetCouponsQuery : IRequest<IReadOnlyList<CouponDto>>;

public record ValidateCouponQuery(string Code, decimal? Subtotal) : IRequest<ValidateCouponResultDto>;

public class GetCouponsQueryHandler : IRequestHandler<GetCouponsQuery, IReadOnlyList<CouponDto>>
{
    private readonly IApplicationDbContext _db;

    public GetCouponsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<CouponDto>> Handle(GetCouponsQuery request, CancellationToken cancellationToken)
    {
        var items = await _db.Coupons
            .AsNoTracking()
            .OrderByDescending(c => c.IsActive)
            .ThenBy(c => c.Code)
            .ToListAsync(cancellationToken);

        return items.Select(CouponMapper.ToDto).ToList();
    }
}

public class ValidateCouponQueryHandler : IRequestHandler<ValidateCouponQuery, ValidateCouponResultDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public ValidateCouponQueryHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<ValidateCouponResultDto> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
    {
        var code = CouponMapper.NormalizeCode(request.Code);
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ValidationException("Code", "کد تخفیف را وارد کنید.");
        }

        var coupon = await _db.Coupons.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken)
            ?? throw new ValidationException("Coupon", "کد تخفیف معتبر نیست.");

        CouponMapper.EnsureUsable(coupon, _clock.UtcNow);

        var subtotal = Math.Max(0, request.Subtotal ?? 0);
        var discount = CouponMapper.ComputeDiscount(coupon, subtotal);

        return new ValidateCouponResultDto(coupon.Code, discount, coupon.PercentOff, coupon.AmountOff);
    }
}
