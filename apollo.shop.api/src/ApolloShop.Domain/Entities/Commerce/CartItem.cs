using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Catalog;

namespace ApolloShop.Domain.Entities.Commerce;

public class CartItem : Entity
{
    public Guid CartId { get; set; }
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceSnapshot { get; set; }
    /// <summary>JSON snapshot of selected order-parameter spec values.</summary>
    public string? SelectedOptionsJson { get; set; }

    public Cart Cart { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
}
