using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;

namespace ApolloShop.Domain.Entities.Support;

/// <summary>One support chat thread between the shop staff and a single customer.</summary>
public class ChatConversation : AuditableEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid CustomerUserId { get; set; }
    public string? LastMessagePreview { get; set; }
    public DateTime? LastMessageAtUtc { get; set; }
    public int UnreadByAdminCount { get; set; }
    public int UnreadByCustomerCount { get; set; }

    /// <summary>When the customer last opened/read this conversation.</summary>
    public DateTime? CustomerLastReadAtUtc { get; set; }

    /// <summary>When an admin last opened/read this conversation.</summary>
    public DateTime? AdminLastReadAtUtc { get; set; }

    public User Customer { get; set; } = null!;
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
