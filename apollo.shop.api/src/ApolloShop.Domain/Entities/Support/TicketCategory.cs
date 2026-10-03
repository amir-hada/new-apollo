using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Support;

public class TicketCategory : Entity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
