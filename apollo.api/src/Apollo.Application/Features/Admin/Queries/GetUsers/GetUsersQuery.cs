using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Admin.Queries.GetUsers;

public sealed record GetUsersQuery : IRequest<IReadOnlyList<AdminUserListItemDto>>;

public sealed class GetUsersQueryHandler
    : IRequestHandler<GetUsersQuery, IReadOnlyList<AdminUserListItemDto>>
{
    private readonly IUserAccountService _userAccountService;

    public GetUsersQueryHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<IReadOnlyList<AdminUserListItemDto>> Handle(
        GetUsersQuery request,
        CancellationToken cancellationToken) =>
        _userAccountService.GetUsersAsync(cancellationToken);
}
