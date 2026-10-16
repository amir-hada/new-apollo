using Apollo.Application.Abstractions.Platforms;
using MediatR;

namespace Apollo.Application.Features.Admin.Commands.DeleteSite;

public sealed record DeleteAdminSiteCommand(Guid PlatformId) : IRequest;

public sealed class DeleteAdminSiteCommandHandler : IRequestHandler<DeleteAdminSiteCommand>
{
    private readonly IUserPlatformService _userPlatformService;

    public DeleteAdminSiteCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task Handle(DeleteAdminSiteCommand request, CancellationToken cancellationToken) =>
        _userPlatformService.AdminDeleteSiteAsync(request.PlatformId, cancellationToken);
}
