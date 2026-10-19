using Apollo.Application.Abstractions.Support;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Commands.CreateSupportTicket;

public sealed record CreateSupportTicketCommand(
    Guid UserId,
    CreateSupportTicketRequest Request) : IRequest<SupportTicketDetailDto>;

public sealed class CreateSupportTicketCommandValidator
    : AbstractValidator<CreateSupportTicketCommand>
{
    public CreateSupportTicketCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.Request.Subject)
            .NotEmpty().WithMessage("موضوع تیکت الزامی است.")
            .MaximumLength(250).WithMessage("موضوع تیکت نباید بیشتر از ۲۵۰ کاراکتر باشد.");

        RuleFor(command => command.Request.Message)
            .NotEmpty().WithMessage("متن پیام الزامی است.")
            .MaximumLength(5000).WithMessage("متن پیام نباید بیشتر از ۵۰۰۰ کاراکتر باشد.");

        RuleFor(command => command.Request.Priority)
            .IsInEnum().WithMessage("اولویت انتخاب‌شده معتبر نیست.");
    }
}

public sealed class CreateSupportTicketCommandHandler
    : IRequestHandler<CreateSupportTicketCommand, SupportTicketDetailDto>
{
    private readonly ISupportTicketService _supportTicketService;

    public CreateSupportTicketCommandHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<SupportTicketDetailDto> Handle(
        CreateSupportTicketCommand request,
        CancellationToken cancellationToken) =>
        _supportTicketService.CreateAsync(request.UserId, request.Request, cancellationToken);
}
