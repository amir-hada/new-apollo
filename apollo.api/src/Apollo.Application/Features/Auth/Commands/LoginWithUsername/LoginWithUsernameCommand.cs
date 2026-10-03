using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.LoginWithUsername;

public sealed record LoginWithUsernameCommand(
    string Username,
    string Password) : IRequest<AuthResponse>;

public sealed class LoginWithUsernameCommandHandler
    : IRequestHandler<LoginWithUsernameCommand, AuthResponse>
{
    private readonly IUserAccountService _userAccountService;

    public LoginWithUsernameCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<AuthResponse> Handle(
        LoginWithUsernameCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.LoginWithUsernameAsync(
            request.Username,
            request.Password,
            cancellationToken);
}

public sealed class LoginWithUsernameCommandValidator : AbstractValidator<LoginWithUsernameCommand>
{
    public LoginWithUsernameCommandValidator()
    {
        RuleFor(command => command.Username)
            .NotEmpty()
            .WithMessage("نام کاربری الزامی است.")
            .MaximumLength(30)
            .WithMessage("نام کاربری نباید بیشتر از ۳۰ کاراکتر باشد.");

        RuleFor(command => command.Password)
            .NotEmpty()
            .WithMessage("رمز عبور الزامی است.");
    }
}
