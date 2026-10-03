using ApolloShop.Application.Features.Tickets.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Tickets.Validators;

public class CreateTicketCommandValidator : AbstractValidator<CreateTicketCommand>
{
    public CreateTicketCommandValidator()
    {
        RuleFor(x => x.Request.Subject).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Request.Message).NotEmpty().MaximumLength(5000);
    }
}

public class ReplyTicketCommandValidator : AbstractValidator<ReplyTicketCommand>
{
    public ReplyTicketCommandValidator()
    {
        RuleFor(x => x.Message).NotEmpty().MaximumLength(5000);
    }
}

public class AdminReplyCommandValidator : AbstractValidator<AdminReplyCommand>
{
    public AdminReplyCommandValidator()
    {
        RuleFor(x => x.Message).NotEmpty().MaximumLength(5000);
    }
}
