using ApolloShop.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.TestData.Queries;

public record GetTestDataTopicsQuery : IRequest<TestDataStatusDto>;

public sealed record TestDataStatusDto(
    IReadOnlyList<TestDataTopicDto> Topics,
    bool HasTestData,
    int ProductCount,
    int BrandCount,
    int CategoryCount,
    int BlogPostCount);

public sealed class GetTestDataTopicsQueryHandler : IRequestHandler<GetTestDataTopicsQuery, TestDataStatusDto>
{
    private readonly IApplicationDbContext _db;

    public GetTestDataTopicsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<TestDataStatusDto> Handle(GetTestDataTopicsQuery request, CancellationToken cancellationToken)
    {
        var marker = TestDataConstants.CreatedByMarker;
        var productCount = await _db.Products.CountAsync(p => p.CreatedBy == marker, cancellationToken);
        var brandCount = await _db.Brands.CountAsync(b => b.CreatedBy == marker, cancellationToken);
        var categoryCount = await _db.Categories.CountAsync(c => c.CreatedBy == marker, cancellationToken);
        var blogCount = await _db.BlogPosts.CountAsync(p => p.CreatedBy == marker, cancellationToken);

        return new TestDataStatusDto(
            TestDataCatalog.ToDtos(),
            productCount + brandCount + categoryCount + blogCount > 0,
            productCount,
            brandCount,
            categoryCount,
            blogCount);
    }
}
