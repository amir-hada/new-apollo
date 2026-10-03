using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.RegisterUser;

public sealed record RegisterUserCommand(
    string Email,
    string Username,
    string Password) : IRequest<AuthResponse>;

public sealed class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResponse>
{
    private readonly IUserAccountService _userAccountService;

    public RegisterUserCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<AuthResponse> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.RegisterWithEmailAsync(
            request.Email,
            request.Username,
            request.Password,
            cancellationToken);
}
