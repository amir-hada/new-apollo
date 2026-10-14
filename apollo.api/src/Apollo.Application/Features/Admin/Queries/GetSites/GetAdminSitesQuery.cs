using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Admin.Queries.GetSites;

public sealed record GetAdminSitesQuery : IRequest<IReadOnlyList<AdminSiteListItemDto>>;

public sealed class GetAdminSitesQueryHandler
    : IRequestHandler<GetAdminSitesQuery, IReadOnlyList<AdminSiteListItemDto>>
{
    private readonly IUserPlatformService _userPlatformService;

    public GetAdminSitesQueryHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<IReadOnlyList<AdminSiteListItemDto>> Handle(
        GetAdminSitesQuery request,
        CancellationToken cancellationToken) =>
        _userPlatformService.GetAdminSitesAsync(cancellationToken);
}
