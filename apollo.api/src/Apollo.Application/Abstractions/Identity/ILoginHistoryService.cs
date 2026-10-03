using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Identity;

public interface ILoginHistoryService
{
    Task RecordLoginAsync(
        Guid userId,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<LoginHistoryDto>> GetRecentLoginsAsync(
        Guid userId,
        int count,
        CancellationToken cancellationToken);
}
