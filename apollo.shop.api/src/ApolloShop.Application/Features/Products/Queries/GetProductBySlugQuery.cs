using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<ProductDetailDto>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetProductBySlugQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<ProductDetailDto> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var product = await ProductMapper.LoadAsync(_db, request.Slug, bySlug: true, cancellationToken)
            ?? throw new NotFoundException("Product", request.Slug);

        if (product.Status != ProductStatus.Published)
        {
            throw new NotFoundException("Product", request.Slug);
        }

        return ProductMapper.ToDetail(product);
    }
}
