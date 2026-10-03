using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Notifications;

public interface INotificationService
{
    Task<NotificationDto> SendAsync(
        Guid userId,
        string type,
        string message,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<NotificationDto>> GetUnreadForUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<PagedResult<NotificationDto>> GetPagedForUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<NotificationDto>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<int> GetUnreadCountAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task MarkAllAsReadAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task EnsureProfileCompleteReminderAsync(
        Guid userId,
        CancellationToken cancellationToken);
}
