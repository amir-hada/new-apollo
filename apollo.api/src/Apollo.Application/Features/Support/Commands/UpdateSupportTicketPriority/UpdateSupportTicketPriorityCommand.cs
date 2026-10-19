using Apollo.Application.Abstractions.Support;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Commands.UpdateSupportTicketPriority;

public sealed record UpdateSupportTicketPriorityCommand(
    Guid AdminUserId,
    Guid TicketId,
    UpdateSupportTicketPriorityRequest Request) : IRequest<SupportTicketDetailDto>;

public sealed class UpdateSupportTicketPriorityCommandValidator
    : AbstractValidator<UpdateSupportTicketPriorityCommand>
{
    public UpdateSupportTicketPriorityCommandValidator()
    {
        RuleFor(command => command.AdminUserId).NotEmpty();
        RuleFor(command => command.TicketId).NotEmpty();
        RuleFor(command => command.Request.Priority).IsInEnum()
            .WithMessage("اولویت انتخاب‌شده معتبر نیست.");
    }
}

public sealed class UpdateSupportTicketPriorityCommandHandler
    : IRequestHandler<UpdateSupportTicketPriorityCommand, SupportTicketDetailDto>
{
    private readonly ISupportTicketService _supportTicketService;

    public UpdateSupportTicketPriorityCommandHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<SupportTicketDetailDto> Handle(
        UpdateSupportTicketPriorityCommand request,
        CancellationToken cancellationToken) =>
        _supportTicketService.UpdatePriorityAsync(
            request.AdminUserId,
            request.TicketId,
            request.Request,
            cancellationToken);
}
