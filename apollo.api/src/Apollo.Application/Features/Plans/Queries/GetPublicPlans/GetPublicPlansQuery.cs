using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Plans.Queries.GetPublicPlans;

public sealed record GetPublicPlansQuery : IRequest<IReadOnlyList<PublicPlanListItemDto>>;

public sealed class GetPublicPlansQueryHandler
    : IRequestHandler<GetPublicPlansQuery, IReadOnlyList<PublicPlanListItemDto>>
{
    private readonly IPlanCatalogService _planCatalogService;

    public GetPublicPlansQueryHandler(IPlanCatalogService planCatalogService)
    {
        _planCatalogService = planCatalogService;
    }

    public Task<IReadOnlyList<PublicPlanListItemDto>> Handle(
        GetPublicPlansQuery request,
        CancellationToken cancellationToken) =>
        _planCatalogService.GetPublicPlansAsync(cancellationToken);
}
