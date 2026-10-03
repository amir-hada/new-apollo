using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Brands.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Brands.Queries;

public record GetBrandsQuery(bool IncludeInactive = false) : IRequest<IReadOnlyList<BrandDto>>;

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, IReadOnlyList<BrandDto>>
{
    private readonly IApplicationDbContext _db;

    public GetBrandsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<BrandDto>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Brands.AsNoTracking().AsQueryable();
        if (!request.IncludeInactive)
        {
            query = query.Where(b => b.IsActive);
        }

        return await query.OrderBy(b => b.Name)
            .Select(b => new BrandDto(
                b.Id,
                b.Name,
                b.Slug,
                b.Description,
                b.ImagePath,
                b.IsActive,
                b.CreatedAtUtc,
                b.UpdatedAtUtc))
            .ToListAsync(cancellationToken);
    }
}

public record GetBrandByIdQuery(Guid Id) : IRequest<BrandDto>;

public class GetBrandByIdQueryHandler : IRequestHandler<GetBrandByIdQuery, BrandDto>
{
    private readonly IApplicationDbContext _db;

    public GetBrandByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<BrandDto> Handle(GetBrandByIdQuery request, CancellationToken cancellationToken)
    {
        var brand = await _db.Brands.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken)
            ?? throw new Domain.Exceptions.NotFoundException("Brand", request.Id);

        return new BrandDto(
            brand.Id,
            brand.Name,
            brand.Slug,
            brand.Description,
            brand.ImagePath,
            brand.IsActive,
            brand.CreatedAtUtc,
            brand.UpdatedAtUtc);
    }
}
