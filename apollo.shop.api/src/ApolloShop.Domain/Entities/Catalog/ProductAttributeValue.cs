using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductAttributeValue : Entity
{
    public Guid AttributeId { get; set; }
    public string Value { get; set; } = string.Empty;

    public ProductAttribute Attribute { get; set; } = null!;
    public ICollection<ProductVariantAttribute> VariantAttributes { get; set; } = new List<ProductVariantAttribute>();
}
