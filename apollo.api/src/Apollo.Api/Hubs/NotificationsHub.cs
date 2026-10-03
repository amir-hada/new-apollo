using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Apollo.Api.Hubs;

[Authorize]
public sealed class NotificationsHub : Hub
{
}
