using Apollo.Application.Abstractions.Platforms;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.SetSiteActiveStatus;

public sealed record SetAdminSiteActiveStatusCommand(Guid PlatformId, bool IsActive) : IRequest;

public sealed class SetAdminSiteActiveStatusCommandHandler
    : IRequestHandler<SetAdminSiteActiveStatusCommand>
{
    private readonly IUserPlatformService _userPlatformService;

    public SetAdminSiteActiveStatusCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task Handle(SetAdminSiteActiveStatusCommand request, CancellationToken cancellationToken) =>
        _userPlatformService.AdminSetSiteActiveAsync(
            request.PlatformId,
            request.IsActive,
            cancellationToken);
}
