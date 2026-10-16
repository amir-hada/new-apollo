using System.Security.Claims;
using ApolloShop.Application.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ApolloShop.Api.Hubs;

[Authorize]
public sealed class ChatHub : Hub
{
    public const string ReceiveMessage = "ReceiveMessage";
    public const string ConversationUpdated = "ConversationUpdated";
    public const string MessagesRead = "MessagesRead";

    private readonly ITenantContext _tenantContext;

    public ChatHub(ITenantContext tenantContext) => _tenantContext = tenantContext;

    public override async Task OnConnectedAsync()
    {
        if (_tenantContext.IsResolved)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, TenantGroup(_tenantContext.TenantId));

            if (Context.User?.IsInRole("Admin") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup(_tenantContext.TenantId));
            }
        }

        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? Context.User?.FindFirstValue("sub");
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
        }

        await base.OnConnectedAsync();
    }

    public Task JoinConversation(Guid conversationId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));

    public Task LeaveConversation(Guid conversationId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));

    public static string TenantGroup(Guid tenantId) => $"tenant:{tenantId}";
    public static string AdminGroup(Guid tenantId) => $"tenant:{tenantId}:admins";
    public static string UserGroup(string userId) => $"user:{userId}";
    public static string ConversationGroup(Guid conversationId) => $"conversation:{conversationId}";
}
