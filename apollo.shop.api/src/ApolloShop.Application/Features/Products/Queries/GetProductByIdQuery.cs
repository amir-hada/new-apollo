using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;

namespace ApolloShop.Application.Features.Products.Queries;

public record GetProductByIdQuery(Guid Id) : IRequest<ProductDetailDto>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetProductByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<ProductDetailDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await ProductMapper.LoadAsync(_db, request.Id.ToString(), bySlug: false, cancellationToken)
            ?? throw new NotFoundException("Product", request.Id);

        return await ProductMapper.ToDetailAsync(_db, product, cancellationToken);
    }
}
