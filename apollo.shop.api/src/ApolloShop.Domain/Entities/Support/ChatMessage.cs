using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;

namespace ApolloShop.Domain.Entities.Support;

public class ChatMessage : Entity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderUserId { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }

    public ChatConversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
