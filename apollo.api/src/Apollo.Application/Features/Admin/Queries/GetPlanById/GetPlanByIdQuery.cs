using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Admin.Queries.GetPlanById;

public sealed record GetPlanByIdQuery(Guid PlanId) : IRequest<AdminPlanListItemDto>;

public sealed class GetPlanByIdQueryValidator : AbstractValidator<GetPlanByIdQuery>
{
    public GetPlanByIdQueryValidator()
    {
        RuleFor(query => query.PlanId)
            .NotEmpty().WithMessage("شناسه پلن الزامی است.");
    }
}

public sealed class GetPlanByIdQueryHandler
    : IRequestHandler<GetPlanByIdQuery, AdminPlanListItemDto>
{
    private readonly IAdminPlanService _adminPlanService;

    public GetPlanByIdQueryHandler(IAdminPlanService adminPlanService)
    {
        _adminPlanService = adminPlanService;
    }

    public Task<AdminPlanListItemDto> Handle(
        GetPlanByIdQuery request,
        CancellationToken cancellationToken) =>
        _adminPlanService.GetPlanByIdAsync(request.PlanId, cancellationToken);
}
