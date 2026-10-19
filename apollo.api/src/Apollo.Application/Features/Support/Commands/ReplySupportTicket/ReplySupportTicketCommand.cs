using Apollo.Application.Abstractions.Support;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Commands.ReplySupportTicket;

public sealed record ReplySupportTicketCommand(
    Guid UserId,
    Guid TicketId,
    ReplySupportTicketRequest Request,
    bool AsStaff) : IRequest<SupportTicketDetailDto>;

public sealed class ReplySupportTicketCommandValidator
    : AbstractValidator<ReplySupportTicketCommand>
{
    public ReplySupportTicketCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.TicketId)
            .NotEmpty().WithMessage("شناسه تیکت الزامی است.");

        RuleFor(command => command.Request.Message)
            .NotEmpty().WithMessage("متن پاسخ الزامی است.")
            .MaximumLength(5000).WithMessage("متن پاسخ نباید بیشتر از ۵۰۰۰ کاراکتر باشد.");
    }
}

public sealed class ReplySupportTicketCommandHandler
    : IRequestHandler<ReplySupportTicketCommand, SupportTicketDetailDto>
{
    private readonly ISupportTicketService _supportTicketService;

    public ReplySupportTicketCommandHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<SupportTicketDetailDto> Handle(
        ReplySupportTicketCommand request,
        CancellationToken cancellationToken) =>
        request.AsStaff
            ? _supportTicketService.ReplyAsAdminAsync(
                request.UserId,
                request.TicketId,
                request.Request,
                cancellationToken)
            : _supportTicketService.ReplyAsUserAsync(
                request.UserId,
                request.TicketId,
                request.Request,
                cancellationToken);
}
