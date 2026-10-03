using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Brands.DTOs;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Brands.Commands;

public record CreateBrandCommand(UpsertBrandRequest Request) : IRequest<BrandDto>;
public record UpdateBrandCommand(Guid Id, UpsertBrandRequest Request) : IRequest<BrandDto>;
public record DeleteBrandCommand(Guid Id) : IRequest;

public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, BrandDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public CreateBrandCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<BrandDto> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.Brands.AnyAsync(b => b.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Brand slug already exists.");
        }

        var entity = new Brand
        {
            Id = Guid.NewGuid(),
            Name = request.Request.Name.Trim(),
            Slug = slug,
            Description = request.Request.Description,
            ImagePath = request.Request.ImagePath,
            IsActive = request.Request.IsActive,
            CreatedAtUtc = _clock.UtcNow
        };

        _db.Brands.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return ToDto(entity);
    }

    internal static BrandDto ToDto(Brand entity) =>
        new(entity.Id, entity.Name, entity.Slug, entity.Description, entity.ImagePath, entity.IsActive, entity.CreatedAtUtc, entity.UpdatedAtUtc);
}

public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, BrandDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateBrandCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<BrandDto> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Brands.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Brand", request.Id);

        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.Brands.AnyAsync(b => b.Slug == slug && b.Id != entity.Id, cancellationToken))
        {
            throw new ConflictException("Brand slug already exists.");
        }

        entity.Name = request.Request.Name.Trim();
        entity.Slug = slug;
        entity.Description = request.Request.Description;
        entity.ImagePath = request.Request.ImagePath;
        entity.IsActive = request.Request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return CreateBrandCommandHandler.ToDto(entity);
    }
}

public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand>
{
    private readonly IApplicationDbContext _db;

    public DeleteBrandCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Brands.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Brand", request.Id);

        var assignedToActive = await _db.Products
            .IgnoreQueryFilters()
            .AnyAsync(p => p.BrandId == entity.Id && !p.IsDeleted, cancellationToken);
        if (assignedToActive)
        {
            throw new ConflictException("Brand is assigned to products.");
        }

        // Detach soft-deleted products so FK does not block brand removal.
        var softDeleted = await _db.Products
            .IgnoreQueryFilters()
            .Where(p => p.BrandId == entity.Id && p.IsDeleted)
            .ToListAsync(cancellationToken);
        foreach (var product in softDeleted)
        {
            product.BrandId = null;
        }

        _db.Brands.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
