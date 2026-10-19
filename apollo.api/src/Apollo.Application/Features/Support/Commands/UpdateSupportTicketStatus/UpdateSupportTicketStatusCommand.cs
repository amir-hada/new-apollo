using Apollo.Application.Abstractions.Support;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Commands.UpdateSupportTicketStatus;

public sealed record UpdateSupportTicketStatusCommand(
    Guid AdminUserId,
    Guid TicketId,
    UpdateSupportTicketStatusRequest Request) : IRequest<SupportTicketDetailDto>;

public sealed class UpdateSupportTicketStatusCommandValidator
    : AbstractValidator<UpdateSupportTicketStatusCommand>
{
    public UpdateSupportTicketStatusCommandValidator()
    {
        RuleFor(command => command.AdminUserId).NotEmpty();
        RuleFor(command => command.TicketId).NotEmpty();
        RuleFor(command => command.Request.Status).IsInEnum()
            .WithMessage("وضعیت انتخاب‌شده معتبر نیست.");
    }
}

public sealed class UpdateSupportTicketStatusCommandHandler
    : IRequestHandler<UpdateSupportTicketStatusCommand, SupportTicketDetailDto>
{
    private readonly ISupportTicketService _supportTicketService;

    public UpdateSupportTicketStatusCommandHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<SupportTicketDetailDto> Handle(
        UpdateSupportTicketStatusCommand request,
        CancellationToken cancellationToken) =>
        _supportTicketService.UpdateStatusAsync(
            request.AdminUserId,
            request.TicketId,
            request.Request,
            cancellationToken);
}
