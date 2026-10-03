using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Auth.Queries.GetCurrentUser;

public sealed record GetCurrentUserQuery(Guid UserId) : IRequest<UserProfileDto>;

public sealed class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileDto>
{
    private readonly IUserAccountService _userAccountService;

    public GetCurrentUserQueryHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<UserProfileDto> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken) =>
        _userAccountService.GetProfileAsync(request.UserId, cancellationToken);
}
