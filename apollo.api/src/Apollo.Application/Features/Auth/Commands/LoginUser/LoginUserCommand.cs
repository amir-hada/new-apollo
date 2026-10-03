using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.LoginUser;

public sealed record LoginUserCommand(string Email, string Password) : IRequest<AuthResponse>;

public sealed class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, AuthResponse>
{
    private readonly IUserAccountService _userAccountService;

    public LoginUserCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<AuthResponse> Handle(
        LoginUserCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.LoginWithEmailAsync(
            request.Email,
            request.Password,
            cancellationToken);
}
