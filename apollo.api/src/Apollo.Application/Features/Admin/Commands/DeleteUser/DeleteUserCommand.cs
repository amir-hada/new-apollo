using Apollo.Application.Abstractions.Identity;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.DeleteUser;

public sealed record DeleteUserCommand(
    Guid UserId,
    Guid RequestedByUserId) : IRequest;

public sealed class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly IAdminUserService _adminUserService;

    public DeleteUserCommandHandler(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    public Task Handle(DeleteUserCommand request, CancellationToken cancellationToken) =>
        _adminUserService.DeleteUserAsync(
            request.UserId,
            request.RequestedByUserId,
            cancellationToken);
}
