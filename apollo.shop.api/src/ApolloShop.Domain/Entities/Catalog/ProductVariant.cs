using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductVariant : Entity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;

    public Product Product { get; set; } = null!;
    public ICollection<ProductVariantAttribute> VariantAttributes { get; set; } = new List<ProductVariantAttribute>();
}
