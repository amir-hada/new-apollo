using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.ForgotPassword;

public sealed record ForgotPasswordCommand(string Email) : IRequest<ForgotPasswordResponse>;

public sealed class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResponse>
{
    private readonly IUserAccountService _userAccountService;

    public ForgotPasswordCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<ForgotPasswordResponse> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.ForgotPasswordAsync(request.Email, cancellationToken);
}

public sealed class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(command => command.Email)
            .NotEmpty().WithMessage("ایمیل الزامی است.")
            .Matches(ValidationRules.EmailPattern).WithMessage("فرمت ایمیل معتبر نیست.");
    }
}
