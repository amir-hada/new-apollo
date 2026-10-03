using Apollo.Application.Abstractions.Identity;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.SetUserActiveStatus;

public sealed record SetUserActiveStatusCommand(
    Guid UserId,
    bool IsActive,
    Guid RequestedByUserId) : IRequest;

public sealed class SetUserActiveStatusCommandHandler : IRequestHandler<SetUserActiveStatusCommand>
{
    private readonly IAdminUserService _adminUserService;

    public SetUserActiveStatusCommandHandler(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    public Task Handle(SetUserActiveStatusCommand request, CancellationToken cancellationToken) =>
        _adminUserService.SetUserActiveStatusAsync(
            request.UserId,
            request.IsActive,
            request.RequestedByUserId,
            cancellationToken);
}
