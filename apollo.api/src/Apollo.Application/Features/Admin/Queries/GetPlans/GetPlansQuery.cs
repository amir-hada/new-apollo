using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Admin.Queries.GetPlans;

public sealed record GetPlansQuery : IRequest<IReadOnlyList<AdminPlanListItemDto>>;

public sealed class GetPlansQueryHandler
    : IRequestHandler<GetPlansQuery, IReadOnlyList<AdminPlanListItemDto>>
{
    private readonly IAdminPlanService _adminPlanService;

    public GetPlansQueryHandler(IAdminPlanService adminPlanService)
    {
        _adminPlanService = adminPlanService;
    }

    public Task<IReadOnlyList<AdminPlanListItemDto>> Handle(
        GetPlansQuery request,
        CancellationToken cancellationToken) =>
        _adminPlanService.GetPlansAsync(cancellationToken);
}
