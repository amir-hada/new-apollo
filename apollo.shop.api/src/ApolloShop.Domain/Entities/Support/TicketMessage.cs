using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;

namespace ApolloShop.Domain.Entities.Support;

public class TicketMessage : AuditableEntity
{
    public Guid TicketId { get; set; }
    public Guid SenderUserId { get; set; }
    public string Body { get; set; } = string.Empty;
    public bool IsStaff { get; set; }

    public Ticket Ticket { get; set; } = null!;
    public User Sender { get; set; } = null!;
    public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
}
