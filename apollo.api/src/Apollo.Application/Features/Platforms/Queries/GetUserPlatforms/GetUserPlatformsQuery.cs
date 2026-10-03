using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Platforms.Queries.GetUserPlatforms;

public sealed record GetUserPlatformsQuery(Guid UserId)
    : IRequest<IReadOnlyList<UserPlatformListItemDto>>;

public sealed class GetUserPlatformsQueryHandler
    : IRequestHandler<GetUserPlatformsQuery, IReadOnlyList<UserPlatformListItemDto>>
{
    private readonly IUserPlatformService _userPlatformService;

    public GetUserPlatformsQueryHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<IReadOnlyList<UserPlatformListItemDto>> Handle(
        GetUserPlatformsQuery request,
        CancellationToken cancellationToken) =>
        _userPlatformService.GetUserPlatformsAsync(request.UserId, cancellationToken);
}
