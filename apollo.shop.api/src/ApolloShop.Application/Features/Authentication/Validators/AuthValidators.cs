using ApolloShop.Application.Features.Authentication.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Authentication.Validators;

public class SendPhoneOtpCommandValidator : AbstractValidator<SendPhoneOtpCommand>
{
    public SendPhoneOtpCommandValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Must(phone => PhoneNormalization.TryNormalize(phone, out _))
            .WithMessage("شماره موبایل معتبر نیست.");
    }
}

public class VerifyPhoneOtpCommandValidator : AbstractValidator<VerifyPhoneOtpCommand>
{
    public VerifyPhoneOtpCommandValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Must(phone => PhoneNormalization.TryNormalize(phone, out _))
            .WithMessage("شماره موبایل معتبر نیست.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .Length(5)
            .Matches(@"^\d{5}$")
            .WithMessage("کد تأیید باید ۵ رقم باشد.");
    }
}

public class LoginWithPhonePasswordCommandValidator : AbstractValidator<LoginWithPhonePasswordCommand>
{
    public LoginWithPhonePasswordCommandValidator()
    {
        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .Must(phone => PhoneNormalization.TryNormalize(phone, out _))
            .WithMessage("شماره موبایل معتبر نیست.");

        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Request.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Request.Password).NotEmpty();
    }
}

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.Request.AccessToken).NotEmpty();
        RuleFor(x => x.Request.RefreshToken).NotEmpty();
    }
}

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8).MaximumLength(128);
    }
}
