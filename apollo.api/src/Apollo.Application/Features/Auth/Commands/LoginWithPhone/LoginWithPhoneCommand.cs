using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.LoginWithPhone;

public sealed record LoginWithPhoneCommand(string MobileNumber, string Code) : IRequest<AuthResponse>;

public sealed class LoginWithPhoneCommandHandler : IRequestHandler<LoginWithPhoneCommand, AuthResponse>
{
    private readonly IUserAccountService _userAccountService;

    public LoginWithPhoneCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<AuthResponse> Handle(
        LoginWithPhoneCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.LoginWithPhoneAsync(
            request.MobileNumber,
            request.Code,
            cancellationToken);
}

public sealed class LoginWithPhoneCommandValidator : AbstractValidator<LoginWithPhoneCommand>
{
    public LoginWithPhoneCommandValidator()
    {
        RuleFor(command => command.MobileNumber)
            .NotEmpty().WithMessage("شماره موبایل الزامی است.")
            .Matches(ValidationRules.MobileNumberPattern)
            .WithMessage("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");

        RuleFor(command => command.Code)
            .NotEmpty().WithMessage("کد تأیید الزامی است.")
            .Matches(ValidationRules.OtpPattern)
            .WithMessage("کد تأیید باید ۵ رقم باشد.");
    }
}
