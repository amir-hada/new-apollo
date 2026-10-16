using ApolloShop.Application.Features.Chats.DTOs;

namespace ApolloShop.Application.Abstractions;

public interface IChatRealtimePublisher
{
    Task PublishMessageAsync(
        ChatMessageDto message,
        Guid customerUserId,
        CancellationToken cancellationToken = default);

    Task PublishConversationUpdatedAsync(
        Guid conversationId,
        Guid customerUserId,
        CancellationToken cancellationToken = default);

    Task PublishMessagesReadAsync(
        ChatMessagesReadDto payload,
        Guid customerUserId,
        CancellationToken cancellationToken = default);
}
