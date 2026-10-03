using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Support;

public class TicketAttachment : Entity
{
    public Guid MessageId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }

    public TicketMessage Message { get; set; } = null!;
}
