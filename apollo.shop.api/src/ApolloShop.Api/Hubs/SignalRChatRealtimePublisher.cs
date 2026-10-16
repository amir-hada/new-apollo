using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Chats.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace ApolloShop.Api.Hubs;

public sealed class SignalRChatRealtimePublisher : IChatRealtimePublisher
{
    private readonly IHubContext<ChatHub> _hub;
    private readonly ITenantContext _tenantContext;

    public SignalRChatRealtimePublisher(IHubContext<ChatHub> hub, ITenantContext tenantContext)
    {
        _hub = hub;
        _tenantContext = tenantContext;
    }

    public async Task PublishMessageAsync(
        ChatMessageDto message,
        Guid customerUserId,
        CancellationToken cancellationToken = default)
    {
        if (!_tenantContext.IsResolved) return;

        await _hub.Clients.Group(ChatHub.AdminGroup(_tenantContext.TenantId))
            .SendAsync(ChatHub.ReceiveMessage, message, cancellationToken);
        await _hub.Clients.Group(ChatHub.UserGroup(customerUserId.ToString()))
            .SendAsync(ChatHub.ReceiveMessage, message, cancellationToken);
    }

    public async Task PublishConversationUpdatedAsync(
        Guid conversationId,
        Guid customerUserId,
        CancellationToken cancellationToken = default)
    {
        if (!_tenantContext.IsResolved) return;

        var payload = new { conversationId, customerUserId };
        await _hub.Clients.Group(ChatHub.AdminGroup(_tenantContext.TenantId))
            .SendAsync(ChatHub.ConversationUpdated, payload, cancellationToken);
        await _hub.Clients.Group(ChatHub.UserGroup(customerUserId.ToString()))
            .SendAsync(ChatHub.ConversationUpdated, payload, cancellationToken);
    }

    public async Task PublishMessagesReadAsync(
        ChatMessagesReadDto payload,
        Guid customerUserId,
        CancellationToken cancellationToken = default)
    {
        if (!_tenantContext.IsResolved) return;

        await _hub.Clients.Group(ChatHub.AdminGroup(_tenantContext.TenantId))
            .SendAsync(ChatHub.MessagesRead, payload, cancellationToken);
        await _hub.Clients.Group(ChatHub.UserGroup(customerUserId.ToString()))
            .SendAsync(ChatHub.MessagesRead, payload, cancellationToken);
    }
}
