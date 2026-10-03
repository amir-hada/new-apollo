using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.RegisterWithPhone;

public sealed record RegisterWithPhoneCommand(string MobileNumber, string Code) : IRequest<AuthResponse>;

public sealed class RegisterWithPhoneCommandHandler : IRequestHandler<RegisterWithPhoneCommand, AuthResponse>
{
    private readonly IUserAccountService _userAccountService;

    public RegisterWithPhoneCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<AuthResponse> Handle(
        RegisterWithPhoneCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.RegisterWithPhoneAsync(
            request.MobileNumber,
            request.Code,
            cancellationToken);
}

public sealed class RegisterWithPhoneCommandValidator : AbstractValidator<RegisterWithPhoneCommand>
{
    public RegisterWithPhoneCommandValidator()
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
