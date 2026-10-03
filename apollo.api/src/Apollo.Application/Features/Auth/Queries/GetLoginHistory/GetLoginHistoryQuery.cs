using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using MediatR;

namespace Apollo.Application.Features.Auth.Queries.GetLoginHistory;

public sealed record GetLoginHistoryQuery(Guid UserId, int Count = 5) : IRequest<IReadOnlyList<LoginHistoryDto>>;

public sealed class GetLoginHistoryQueryHandler : IRequestHandler<GetLoginHistoryQuery, IReadOnlyList<LoginHistoryDto>>
{
    private readonly ILoginHistoryService _loginHistoryService;

    public GetLoginHistoryQueryHandler(ILoginHistoryService loginHistoryService)
    {
        _loginHistoryService = loginHistoryService;
    }

    public Task<IReadOnlyList<LoginHistoryDto>> Handle(
        GetLoginHistoryQuery request,
        CancellationToken cancellationToken) =>
        _loginHistoryService.GetRecentLoginsAsync(
            request.UserId,
            request.Count,
            cancellationToken);
}
