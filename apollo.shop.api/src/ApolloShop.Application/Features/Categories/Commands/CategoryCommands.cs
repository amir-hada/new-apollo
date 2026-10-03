using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Categories.DTOs;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Categories.Commands;

public record CreateCategoryCommand(UpsertCategoryRequest Request) : IRequest<CategoryDto>;
public record UpdateCategoryCommand(Guid Id, UpsertCategoryRequest Request) : IRequest<CategoryDto>;
public record DeleteCategoryCommand(Guid Id) : IRequest;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public CreateCategoryCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.Categories.AnyAsync(c => c.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Category slug already exists.");
        }

        var entity = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Request.Name.Trim(),
            Slug = slug,
            Description = request.Request.Description,
            ParentId = request.Request.ParentId,
            SortOrder = request.Request.SortOrder,
            IsActive = request.Request.IsActive,
            CreatedAtUtc = _clock.UtcNow
        };

        _db.Categories.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new CategoryDto(entity.Id, entity.Name, entity.Slug, entity.Description, entity.ParentId, entity.SortOrder, entity.IsActive);
    }
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateCategoryCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Category", request.Id);

        var slug = request.Request.Slug.Trim().ToLowerInvariant();
        if (await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != entity.Id, cancellationToken))
        {
            throw new ConflictException("Category slug already exists.");
        }

        entity.Name = request.Request.Name.Trim();
        entity.Slug = slug;
        entity.Description = request.Request.Description;
        entity.ParentId = request.Request.ParentId;
        entity.SortOrder = request.Request.SortOrder;
        entity.IsActive = request.Request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);

        return new CategoryDto(entity.Id, entity.Name, entity.Slug, entity.Description, entity.ParentId, entity.SortOrder, entity.IsActive);
    }
}

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly IApplicationDbContext _db;

    public DeleteCategoryCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Category", request.Id);

        if (await _db.Categories.AnyAsync(c => c.ParentId == entity.Id, cancellationToken))
        {
            throw new ConflictException("Category has child categories.");
        }

        if (await _db.Products.IgnoreQueryFilters().AnyAsync(p => p.CategoryId == entity.Id && !p.IsDeleted, cancellationToken))
        {
            throw new ConflictException("Category is assigned to products.");
        }

        var softDeleted = await _db.Products
            .IgnoreQueryFilters()
            .Where(p => p.CategoryId == entity.Id && p.IsDeleted)
            .ToListAsync(cancellationToken);
        foreach (var product in softDeleted)
        {
            product.CategoryId = null;
        }

        _db.Categories.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
