using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Enums;

namespace ApolloShop.Domain.Entities.Support;

public class Ticket : AuditableEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string Number { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public Guid? AssignedToUserId { get; set; }
    public Guid? CategoryId { get; set; }

    public User User { get; set; } = null!;
    public User? AssignedToUser { get; set; }
    public TicketCategory? Category { get; set; }
    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
}
