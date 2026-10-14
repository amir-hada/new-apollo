using System.Security.Cryptography;
using System.Text;
using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.Commands;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Application.Features.Tenancy.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Tenancy;
using ApolloShop.Domain.Exceptions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tenancy.Commands;

public static class ShopSso
{
    public static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(2);

    public static string HashCode(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code))).ToLowerInvariant();
}

public record CreateSsoCodeCommand(string Slug, string Email) : IRequest<InternalSsoCodeResultDto>;

public class CreateSsoCodeCommandValidator : AbstractValidator<CreateSsoCodeCommand>
{
    public CreateSsoCodeCommandValidator()
    {
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class CreateSsoCodeCommandHandler : IRequestHandler<CreateSsoCodeCommand, InternalSsoCodeResultDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IDateTimeProvider _clock;

    public CreateSsoCodeCommandHandler(IApplicationDbContext db, ITenantContext tenantContext, IDateTimeProvider clock)
    {
        _db = db;
        _tenantContext = tenantContext;
        _clock = clock;
    }

    public async Task<InternalSsoCodeResultDto> Handle(CreateSsoCodeCommand request, CancellationToken cancellationToken)
    {
        // Platform operation: not bound to the tenant resolved from the request host.
        _tenantContext.Bypass();

        var slug = request.Slug.Trim().ToLowerInvariant();
        var email = request.Email.Trim().ToLowerInvariant();

        var tenant = await _db.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive, cancellationToken)
            ?? throw new NotFoundException("Tenant", slug);

        var adminExists = await _db.Users.AsNoTracking()
            .AnyAsync(
                u => u.TenantId == tenant.Id && u.Email == email && u.IsActive &&
                     u.UserRoles.Any(ur => ur.Role.Name == WellKnownRoles.Admin),
                cancellationToken);

        if (!adminExists)
        {
            throw new NotFoundException("Admin user", email);
        }

        var now = _clock.UtcNow;

        // Drop expired codes opportunistically so the table stays small.
        var expired = await _db.ShopSsoCodes
            .Where(c => c.ExpiresAtUtc < now.AddHours(-1))
            .ToListAsync(cancellationToken);
        _db.ShopSsoCodes.RemoveRange(expired);

        var code = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var expiresAt = now.Add(ShopSso.CodeLifetime);

        _db.ShopSsoCodes.Add(new ShopSsoCode
        {
            Id = Guid.NewGuid(),
            CodeHash = ShopSso.HashCode(code),
            TenantId = tenant.Id,
            UserEmail = email,
            ExpiresAtUtc = expiresAt,
            CreatedAtUtc = now
        });

        await _db.SaveChangesAsync(cancellationToken);
        return new InternalSsoCodeResultDto(code, expiresAt);
    }
}

public record ExchangeSsoCodeCommand(string Code, string? IpAddress) : IRequest<AuthResponse>;

public class ExchangeSsoCodeCommandValidator : AbstractValidator<ExchangeSsoCodeCommand>
{
    public ExchangeSsoCodeCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(128);
    }
}

public class ExchangeSsoCodeCommandHandler : IRequestHandler<ExchangeSsoCodeCommand, AuthResponse>
{
    private const string InvalidCodeMessage = "SSO code is invalid or expired.";

    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public ExchangeSsoCodeCommandHandler(
        IApplicationDbContext db,
        ITenantContext tenantContext,
        IJwtTokenService jwt,
        IDateTimeProvider clock)
    {
        _db = db;
        _tenantContext = tenantContext;
        _jwt = jwt;
        _clock = clock;
    }

    public async Task<AuthResponse> Handle(ExchangeSsoCodeCommand request, CancellationToken cancellationToken)
    {
        var now = _clock.UtcNow;
        var hash = ShopSso.HashCode(request.Code.Trim());

        var sso = await _db.ShopSsoCodes
            .FirstOrDefaultAsync(c => c.CodeHash == hash, cancellationToken);

        if (sso is null || sso.UsedAtUtc is not null || sso.ExpiresAtUtc < now)
        {
            throw new Domain.Exceptions.ValidationException("Code", InvalidCodeMessage);
        }

        var tenant = await _db.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == sso.TenantId && t.IsActive, cancellationToken)
            ?? throw new Domain.Exceptions.ValidationException("Code", InvalidCodeMessage);

        // Mark as used first; the guarded update guarantees a single winner on concurrent requests.
        var updated = await _db.ShopSsoCodes
            .Where(c => c.Id == sso.Id && c.UsedAtUtc == null)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.UsedAtUtc, now), cancellationToken);

        if (updated == 0)
        {
            throw new Domain.Exceptions.ValidationException("Code", InvalidCodeMessage);
        }

        _tenantContext.Set(tenant.Id, tenant.Slug);

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(
                u => u.Email == sso.UserEmail && u.IsActive,
                cancellationToken)
            ?? throw new Domain.Exceptions.ValidationException("Code", InvalidCodeMessage);

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        user.LastLoginAtUtc = now;
        var auth = await AuthHelper.IssueTokensAsync(_db, _jwt, _clock, user, roles, permissions, request.IpAddress, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return auth;
    }
}
