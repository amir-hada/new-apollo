using ApolloShop.Application.Features.Chats.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Support;

namespace ApolloShop.Application.Features.Chats;

internal static class ChatMapper
{
    public static string FullName(User user) =>
        $"{user.FirstName} {user.LastName}".Trim();

    public static ChatConversationDto ToConversationDto(
        ChatConversation c,
        bool asAdmin,
        string? peerFullName = null,
        string? peerAvatarUrl = null) =>
        new(
            c.Id,
            c.CustomerUserId,
            FullName(c.Customer),
            c.Customer.Email,
            c.Customer.PhoneNumber,
            c.Customer.AvatarUrl,
            c.LastMessagePreview,
            c.LastMessageAtUtc,
            asAdmin ? c.UnreadByAdminCount : c.UnreadByCustomerCount,
            peerFullName,
            peerAvatarUrl,
            asAdmin ? c.CustomerLastReadAtUtc : c.AdminLastReadAtUtc);

    public static ChatMessageDto ToMessageDto(
        ChatMessage m,
        Guid currentUserId,
        DateTime? peerLastReadAtUtc = null)
    {
        var isMine = m.SenderUserId == currentUserId;
        var isRead = isMine
            && peerLastReadAtUtc.HasValue
            && m.CreatedAtUtc <= peerLastReadAtUtc.Value;

        return new(
            m.Id,
            m.ConversationId,
            m.SenderUserId,
            FullName(m.Sender),
            isMine,
            m.Body,
            m.CreatedAtUtc,
            m.Sender.AvatarUrl,
            isRead);
    }

    public static ChatUserSearchDto ToUserSearchDto(User u) =>
        new(u.Id, FullName(u), u.Email, u.PhoneNumber, u.AvatarUrl);

    public static string Preview(string body)
    {
        var trimmed = body.Trim();
        return trimmed.Length <= 200 ? trimmed : trimmed[..200] + "…";
    }
}
