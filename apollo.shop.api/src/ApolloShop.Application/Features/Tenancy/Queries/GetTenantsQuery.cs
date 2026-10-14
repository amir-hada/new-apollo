using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Tenancy.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tenancy.Queries;

public record GetTenantsQuery : IRequest<IReadOnlyList<TenantDto>>;

public class GetTenantsQueryHandler : IRequestHandler<GetTenantsQuery, IReadOnlyList<TenantDto>>
{
    private readonly IApplicationDbContext _db;

    public GetTenantsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<TenantDto>> Handle(GetTenantsQuery request, CancellationToken cancellationToken) =>
        await _db.Tenants.AsNoTracking()
            .OrderBy(t => t.CreatedAtUtc)
            .Select(t => new TenantDto(t.Id, t.Slug, t.Name, t.CustomDomain, t.IsActive, t.CreatedAtUtc))
            .ToListAsync(cancellationToken);
}
