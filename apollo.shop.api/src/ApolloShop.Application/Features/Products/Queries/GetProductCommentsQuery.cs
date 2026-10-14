using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Queries;

public record ProductCommentListItemDto(
    Guid Id,
    string Body,
    int? Rating,
    DateTime CreatedAtUtc,
    string AuthorName);

public record GetProductCommentsQuery(Guid ProductId, int Page = 1, int PageSize = 20)
    : IRequest<IReadOnlyList<ProductCommentListItemDto>>;

public class GetProductCommentsQueryHandler
    : IRequestHandler<GetProductCommentsQuery, IReadOnlyList<ProductCommentListItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetProductCommentsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<ProductCommentListItemDto>> Handle(
        GetProductCommentsQuery request,
        CancellationToken cancellationToken)
    {
        var exists = await _db.Products.AnyAsync(p => p.Id == request.ProductId, cancellationToken);
        if (!exists) throw new NotFoundException("Product", request.ProductId);

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);

        return await (
                from c in _db.ProductComments.AsNoTracking()
                join u in _db.Users.AsNoTracking() on c.UserId equals u.Id into uj
                from u in uj.DefaultIfEmpty()
                where c.ProductId == request.ProductId && c.IsApproved
                orderby c.CreatedAtUtc descending
                select new ProductCommentListItemDto(
                    c.Id,
                    c.Body,
                    c.Rating,
                    c.CreatedAtUtc,
                    u != null
                        ? ((u.FirstName + " " + u.LastName).Trim())
                        : "خریدار")
            )
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }
}
