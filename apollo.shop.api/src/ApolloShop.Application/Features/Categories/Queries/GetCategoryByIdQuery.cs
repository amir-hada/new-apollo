using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Categories.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Categories.Queries;

public record GetCategoryByIdQuery(Guid Id) : IRequest<CategoryDto>;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto>
{
    private readonly IApplicationDbContext _db;

    public GetCategoryByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CategoryDto> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Category", request.Id);

        return new CategoryDto(
            entity.Id,
            entity.Name,
            entity.Slug,
            entity.Description,
            entity.ParentId,
            entity.SortOrder,
            entity.IsActive);
    }
}
