using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Categories.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Categories.Queries;

public record GetCategoryTreeQuery(bool IncludeInactive = false) : IRequest<IReadOnlyList<CategoryTreeDto>>;

public class GetCategoryTreeQueryHandler : IRequestHandler<GetCategoryTreeQuery, IReadOnlyList<CategoryTreeDto>>
{
    private readonly IApplicationDbContext _db;

    public GetCategoryTreeQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<CategoryTreeDto>> Handle(GetCategoryTreeQuery request, CancellationToken cancellationToken)
    {
        var categories = await _db.Categories.AsNoTracking().OrderBy(c => c.SortOrder).ThenBy(c => c.Name).ToListAsync(cancellationToken);
        if (!request.IncludeInactive)
        {
            categories = categories.Where(c => c.IsActive).ToList();
        }

        CategoryTreeDto Map(ApolloShop.Domain.Entities.Catalog.Category c) =>
            new(c.Id, c.Name, c.Slug, c.Description, c.SortOrder, c.IsActive,
                categories.Where(x => x.ParentId == c.Id).Select(Map).ToList());

        return categories.Where(c => c.ParentId is null).Select(Map).ToList();
    }
}
