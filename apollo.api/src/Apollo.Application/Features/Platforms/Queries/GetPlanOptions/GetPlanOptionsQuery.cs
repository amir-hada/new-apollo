using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using MediatR;

namespace Apollo.Application.Features.Platforms.Queries.GetPlanOptions;

public sealed record GetPlanOptionsQuery(PlanProductType? ProductType = null)
    : IRequest<IReadOnlyList<PlanOptionDto>>;

public sealed class GetPlanOptionsQueryHandler
    : IRequestHandler<GetPlanOptionsQuery, IReadOnlyList<PlanOptionDto>>
{
    private readonly IUserPlatformService _userPlatformService;

    public GetPlanOptionsQueryHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<IReadOnlyList<PlanOptionDto>> Handle(
        GetPlanOptionsQuery request,
        CancellationToken cancellationToken) =>
        _userPlatformService.GetPlanOptionsAsync(request.ProductType, cancellationToken);
}
