using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Enums;

namespace ApolloShop.Domain.Entities.Commerce;

public class Order : AuditableEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string Currency { get; set; } = "IRR";
    public string ShippingAddressSnapshot { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? PaidAtUtc { get; set; }

    public User User { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
