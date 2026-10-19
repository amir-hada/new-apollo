using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Coupons.DTOs;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Coupons.Commands;

public record CreateCouponCommand(UpsertCouponRequest Request) : IRequest<CouponDto>;
public record UpdateCouponCommand(Guid Id, UpsertCouponRequest Request) : IRequest<CouponDto>;
public record DeleteCouponCommand(Guid Id) : IRequest;
public record SetCouponActiveCommand(Guid Id, bool IsActive) : IRequest<CouponDto>;

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, CouponDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenant;

    public CreateCouponCommandHandler(IApplicationDbContext db, ITenantContext tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    public async Task<CouponDto> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        var code = CouponMapper.NormalizeCode(request.Request.Code);
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ValidationException("Code", "کد تخفیف را وارد کنید.");
        }

        ValidateDiscount(request.Request);

        if (await _db.Coupons.AnyAsync(c => c.Code == code, cancellationToken))
        {
            throw new ConflictException("این کد تخفیف قبلاً ثبت شده است.");
        }

        var entity = new Coupon
        {
            Id = Guid.NewGuid(),
            TenantId = _tenant.TenantId,
            Code = code,
            PercentOff = request.Request.PercentOff is > 0 ? request.Request.PercentOff : null,
            AmountOff = request.Request.AmountOff is > 0 ? request.Request.AmountOff : null,
            IsActive = request.Request.IsActive,
            StartsAtUtc = request.Request.StartsAtUtc,
            EndsAtUtc = request.Request.EndsAtUtc,
            MaxUses = request.Request.MaxUses is > 0 ? request.Request.MaxUses : null,
            UsedCount = 0
        };

        // Prefer percent when both provided.
        if (entity.PercentOff.HasValue)
        {
            entity.AmountOff = null;
        }

        _db.Coupons.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return CouponMapper.ToDto(entity);
    }

    internal static void ValidateDiscount(UpsertCouponRequest r)
    {
        var hasPercent = r.PercentOff is > 0;
        var hasAmount = r.AmountOff is > 0;
        if (!hasPercent && !hasAmount)
        {
            throw new ValidationException("Discount", "درصد یا مبلغ تخفیف را مشخص کنید.");
        }

        if (hasPercent && r.PercentOff is > 100)
        {
            throw new ValidationException("PercentOff", "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.");
        }
    }
}

public class UpdateCouponCommandHandler : IRequestHandler<UpdateCouponCommand, CouponDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateCouponCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CouponDto> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Coupon", request.Id);

        var code = CouponMapper.NormalizeCode(request.Request.Code);
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ValidationException("Code", "کد تخفیف را وارد کنید.");
        }

        CreateCouponCommandHandler.ValidateDiscount(request.Request);

        if (await _db.Coupons.AnyAsync(c => c.Code == code && c.Id != entity.Id, cancellationToken))
        {
            throw new ConflictException("این کد تخفیف قبلاً ثبت شده است.");
        }

        entity.Code = code;
        entity.PercentOff = request.Request.PercentOff is > 0 ? request.Request.PercentOff : null;
        entity.AmountOff = request.Request.AmountOff is > 0 ? request.Request.AmountOff : null;
        if (entity.PercentOff.HasValue)
        {
            entity.AmountOff = null;
        }

        entity.IsActive = request.Request.IsActive;
        entity.StartsAtUtc = request.Request.StartsAtUtc;
        entity.EndsAtUtc = request.Request.EndsAtUtc;
        entity.MaxUses = request.Request.MaxUses is > 0 ? request.Request.MaxUses : null;

        await _db.SaveChangesAsync(cancellationToken);
        return CouponMapper.ToDto(entity);
    }
}

public class DeleteCouponCommandHandler : IRequestHandler<DeleteCouponCommand>
{
    private readonly IApplicationDbContext _db;

    public DeleteCouponCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Coupon", request.Id);

        _db.Coupons.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class SetCouponActiveCommandHandler : IRequestHandler<SetCouponActiveCommand, CouponDto>
{
    private readonly IApplicationDbContext _db;

    public SetCouponActiveCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CouponDto> Handle(SetCouponActiveCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Coupons.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Coupon", request.Id);

        entity.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return CouponMapper.ToDto(entity);
    }
}
