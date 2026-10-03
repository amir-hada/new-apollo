using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Notifications;

public interface INotificationPushClient
{
    Task PushAsync(
        Guid userId,
        NotificationDto notification,
        CancellationToken cancellationToken);
}
