using System.Text.RegularExpressions;
using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.Queries;
using ApolloShop.Application.Features.Tenancy.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Support;
using ApolloShop.Domain.Entities.Tenancy;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tenancy.Commands;

public record CreateTenantCommand(CreateTenantRequest Request) : IRequest<CreateTenantResultDto>;

public partial class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, CreateTenantResultDto>
{
    private static readonly string[] ReservedSlugs = ["www", "api", "localhost", "swagger", "health"];

    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenantContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _clock;

    public CreateTenantCommandHandler(
        IApplicationDbContext db,
        ITenantContext tenantContext,
        IPasswordHasher passwordHasher,
        IDateTimeProvider clock)
    {
        _db = db;
        _tenantContext = tenantContext;
        _passwordHasher = passwordHasher;
        _clock = clock;
    }

    public async Task<CreateTenantResultDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var r = request.Request;
        var slug = NormalizeSlug(r.Slug);
        if (slug.Length == 0 || slug.Length > 64 || !SlugPattern().IsMatch(slug) || ReservedSlugs.Contains(slug))
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Slug", "Slug must contain only a-z, 0-9 and '-' (max 64 characters).");
        }

        // Platform operation: writes rows for a tenant other than the one resolved for this request.
        _tenantContext.Bypass();

        if (await _db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Tenant slug already exists.");
        }

        var now = _clock.UtcNow;
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Slug = slug,
            Name = r.Name.Trim(),
            ExternalOwnerId = r.ExternalOwnerId,
            IsActive = true,
            CreatedAtUtc = now
        };

        var adminRole = await EnsureRoleAsync(WellKnownRoles.AdminId, WellKnownRoles.Admin, "Full system access", cancellationToken);
        await EnsureRoleAsync(WellKnownRoles.CustomerId, WellKnownRoles.Customer, "Store customer", cancellationToken);
        await EnsureRoleAsync(WellKnownRoles.PlatformAdminId, WellKnownRoles.PlatformAdmin, "Cross-tenant platform administration", cancellationToken);

        var shopTitle = string.IsNullOrWhiteSpace(r.ShopTitle) ? tenant.Name : r.ShopTitle.Trim();
        var settings = GetShopSettingsQueryHandler.CreateDefault(tenant.Id);
        settings.ShopTitle = shopTitle;
        settings.BrowserTitle = shopTitle;
        settings.Description = null;
        settings.MetaDescription = null;
        settings.PrimaryColor = NormalizePrimaryColor(r.PrimaryColor) ?? settings.PrimaryColor;
        settings.CreatedAtUtc = now;

        var adminEmail = r.AdminEmail.Trim().ToLowerInvariant();
        var admin = new User
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            Email = adminEmail,
            PasswordHash = _passwordHasher.Hash(r.AdminPassword),
            FirstName = r.AdminFirstName.Trim(),
            LastName = r.AdminLastName.Trim(),
            IsActive = true,
            EmailConfirmed = true,
            CreatedAtUtc = now,
            CreatedBy = "system"
        };

        _db.Tenants.Add(tenant);
        _db.ShopSettings.Add(settings);
        _db.TicketCategories.AddRange(
            NewTicketCategory(tenant.Id, "سفارشات", "پیگیری و مشکلات سفارش"),
            NewTicketCategory(tenant.Id, "پرداخت", "مسائل مربوط به پرداخت"),
            NewTicketCategory(tenant.Id, "فنی", "مشکلات فنی وب‌سایت"));
        _db.Users.Add(admin);
        _db.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = adminRole.Id });

        await _db.SaveChangesAsync(cancellationToken);

        return new CreateTenantResultDto(tenant.Id, tenant.Slug, tenant.Name, admin.Email);
    }

    internal static string NormalizeSlug(string? slug) => (slug ?? string.Empty).Trim().ToLowerInvariant();

    private static TicketCategory NewTicketCategory(Guid tenantId, string name, string description) => new()
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Name = name,
        Description = description
    };

    private async Task<Role> EnsureRoleAsync(Guid id, string name, string description, CancellationToken cancellationToken)
    {
        var normalized = name.ToUpperInvariant();
        var role = await _db.Roles.FirstOrDefaultAsync(x => x.NormalizedName == normalized, cancellationToken);
        if (role is not null)
        {
            return role;
        }

        role = new Role { Id = id, Name = name, NormalizedName = normalized, Description = description };
        _db.Roles.Add(role);
        return role;
    }

    private static string? NormalizePrimaryColor(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var hex = value.Trim();
        if (!hex.StartsWith('#')) hex = "#" + hex;
        return hex.Length is 4 or 7 ? hex.ToLowerInvariant() : null;
    }

    [GeneratedRegex("^[a-z0-9-]+$")]
    private static partial Regex SlugPattern();
}
