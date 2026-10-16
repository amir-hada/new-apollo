namespace ApolloShop.Application.Features.Chats.DTOs;

public record ChatUserSearchDto(
    Guid Id,
    string FullName,
    string? Email,
    string? PhoneNumber,
    string? AvatarUrl);

public record ChatConversationDto(
    Guid Id,
    Guid CustomerUserId,
    string CustomerFullName,
    string? CustomerEmail,
    string? CustomerPhone,
    string? CustomerAvatarUrl,
    string? LastMessagePreview,
    DateTime? LastMessageAtUtc,
    int UnreadCount,
    /// <summary>For customer UI: support/admin display name. For admin UI: usually null.</summary>
    string? PeerFullName = null,
    string? PeerAvatarUrl = null,
    /// <summary>When the other party last read the conversation (for tick UI).</summary>
    DateTime? PeerLastReadAtUtc = null);

public record ChatMessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderUserId,
    string SenderFullName,
    bool IsMine,
    string Body,
    DateTime CreatedAtUtc,
    string? SenderAvatarUrl = null,
    /// <summary>True when the peer has read this (own) message.</summary>
    bool IsRead = false);

public record ChatMessagesReadDto(
    Guid ConversationId,
    Guid ReaderUserId,
    DateTime ReadAtUtc,
    bool ReaderIsAdmin);

public record SendChatMessageRequest(string Body);

public record StartChatRequest(Guid CustomerUserId, string? InitialMessage);
