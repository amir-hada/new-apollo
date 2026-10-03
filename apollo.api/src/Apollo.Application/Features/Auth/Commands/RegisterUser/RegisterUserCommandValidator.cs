using Apollo.Domain.Constants;
using FluentValidation;

namespace Apollo.Application.Features.Auth.Commands.RegisterUser;

public sealed class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(command => command.Email)
            .NotEmpty().WithMessage("ایمیل الزامی است.")
            .Matches(ValidationRules.EmailPattern).WithMessage("فرمت ایمیل معتبر نیست.");

        RuleFor(command => command.Username)
            .NotEmpty().WithMessage("نام کاربری الزامی است.")
            .MinimumLength(3).WithMessage("نام کاربری باید حداقل ۳ کاراکتر باشد.")
            .MaximumLength(30).WithMessage("نام کاربری نباید بیشتر از ۳۰ کاراکتر باشد.")
            .Matches(ValidationRules.UsernamePattern)
            .WithMessage("نام کاربری فقط می‌تواند شامل حروف، اعداد و زیرخط باشد.");

        RuleFor(command => command.Password)
            .NotEmpty().WithMessage("رمز عبور الزامی است.")
            .MinimumLength(ValidationRules.PasswordMinLength)
            .WithMessage($"رمز عبور باید حداقل {ValidationRules.PasswordMinLength} کاراکتر باشد.")
            .Matches(ValidationRules.PasswordPattern)
            .WithMessage("رمز عبور باید شامل حروف بزرگ، حروف کوچک و عدد باشد.");
    }
}
