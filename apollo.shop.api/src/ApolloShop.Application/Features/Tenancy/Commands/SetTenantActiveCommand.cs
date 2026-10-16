using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Tenancy.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tenancy.Commands;

public record SetTenantActiveCommand(string Slug, bool IsActive) : IRequest<TenantDto>;

public sealed class SetTenantActiveCommandHandler : IRequestHandler<SetTenantActiveCommand, TenantDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenantContext;

    public SetTenantActiveCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task<TenantDto> Handle(SetTenantActiveCommand request, CancellationToken cancellationToken)
    {
        _tenantContext.Bypass();

        var slug = request.Slug.Trim().ToLowerInvariant();
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Slug == slug, cancellationToken)
            ?? throw new NotFoundException("Tenant", slug);

        tenant.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);

        return new TenantDto(
            tenant.Id,
            tenant.Slug,
            tenant.Name,
            tenant.CustomDomain,
            tenant.IsActive,
            tenant.CreatedAtUtc);
    }
}
