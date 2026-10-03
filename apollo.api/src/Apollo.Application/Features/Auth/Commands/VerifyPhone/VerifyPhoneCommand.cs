using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.VerifyPhone;

public sealed record VerifyPhoneCommand(string MobileNumber, string Code) : IRequest<AuthResponse>;

public sealed class VerifyPhoneCommandHandler : IRequestHandler<VerifyPhoneCommand, AuthResponse>
{
    private readonly IUserAccountService _userAccountService;

    public VerifyPhoneCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<AuthResponse> Handle(
        VerifyPhoneCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.VerifyPhoneAsync(
            request.MobileNumber,
            request.Code,
            cancellationToken);
}

public sealed class VerifyPhoneCommandValidator : AbstractValidator<VerifyPhoneCommand>
{
    public VerifyPhoneCommandValidator()
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
