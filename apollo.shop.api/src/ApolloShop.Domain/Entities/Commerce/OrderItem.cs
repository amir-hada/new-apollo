using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Catalog;

namespace ApolloShop.Domain.Entities.Commerce;

public class OrderItem : Entity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    /// <summary>JSON snapshot of selected order-parameter options at checkout.</summary>
    public string? SelectedOptionsJson { get; set; }

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
}
