using Apollo.Application.Abstractions.Support;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Queries.GetSupportTicketById;

public sealed record GetSupportTicketByIdQuery(
    Guid TicketId,
    Guid? UserId,
    bool AsAdmin) : IRequest<SupportTicketDetailDto>;

public sealed class GetSupportTicketByIdQueryValidator
    : AbstractValidator<GetSupportTicketByIdQuery>
{
    public GetSupportTicketByIdQueryValidator()
    {
        RuleFor(query => query.TicketId).NotEmpty();
        RuleFor(query => query.UserId)
            .NotEmpty()
            .When(query => !query.AsAdmin)
            .WithMessage("شناسه کاربر الزامی است.");
    }
}

public sealed class GetSupportTicketByIdQueryHandler
    : IRequestHandler<GetSupportTicketByIdQuery, SupportTicketDetailDto>
{
    private readonly ISupportTicketService _supportTicketService;

    public GetSupportTicketByIdQueryHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<SupportTicketDetailDto> Handle(
        GetSupportTicketByIdQuery request,
        CancellationToken cancellationToken) =>
        request.AsAdmin
            ? _supportTicketService.GetByIdForAdminAsync(request.TicketId, cancellationToken)
            : _supportTicketService.GetByIdForUserAsync(
                request.UserId!.Value,
                request.TicketId,
                cancellationToken);
}
