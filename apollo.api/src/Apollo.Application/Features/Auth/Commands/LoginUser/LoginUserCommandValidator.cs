using Apollo.Domain.Constants;
using FluentValidation;

namespace Apollo.Application.Features.Auth.Commands.LoginUser;

public sealed class LoginUserCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserCommandValidator()
    {
        RuleFor(command => command.Email)
            .NotEmpty().WithMessage("ایمیل الزامی است.")
            .Matches(ValidationRules.EmailPattern).WithMessage("فرمت ایمیل معتبر نیست.");

        RuleFor(command => command.Password)
            .NotEmpty().WithMessage("رمز عبور الزامی است.");
    }
}
