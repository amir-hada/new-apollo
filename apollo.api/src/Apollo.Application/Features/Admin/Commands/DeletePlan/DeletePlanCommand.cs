using Apollo.Application.Abstractions.Plans;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.DeletePlan;

public sealed record DeletePlanCommand(Guid PlanId) : IRequest;

public sealed class DeletePlanCommandHandler : IRequestHandler<DeletePlanCommand>
{
    private readonly IAdminPlanService _adminPlanService;

    public DeletePlanCommandHandler(IAdminPlanService adminPlanService)
    {
        _adminPlanService = adminPlanService;
    }

    public Task Handle(DeletePlanCommand request, CancellationToken cancellationToken) =>
        _adminPlanService.DeletePlanAsync(request.PlanId, cancellationToken);
}
