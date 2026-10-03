using Apollo.Application.Abstractions.Notifications;
using Apollo.Application.Common.Models;
using Apollo.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Apollo.Api.Notifications;

public sealed class SignalRNotificationPushClient : INotificationPushClient
{
    private readonly IHubContext<NotificationsHub> _hubContext;

    public SignalRNotificationPushClient(IHubContext<NotificationsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PushAsync(
        Guid userId,
        NotificationDto notification,
        CancellationToken cancellationToken) =>
        _hubContext.Clients
            .User(userId.ToString())
            .SendAsync("ReceiveNotification", notification, cancellationToken);
}
