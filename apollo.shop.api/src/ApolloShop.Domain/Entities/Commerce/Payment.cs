using ApolloShop.Domain.Common;
using ApolloShop.Domain.Enums;

namespace ApolloShop.Domain.Entities.Commerce;

public class Payment : AuditableEntity
{
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string Gateway { get; set; } = string.Empty;
    public string? TrackingCode { get; set; }
    public string? Authority { get; set; }
    public DateTime? PaidAtUtc { get; set; }
    public string? RawResponse { get; set; }

    public Order Order { get; set; } = null!;
}
