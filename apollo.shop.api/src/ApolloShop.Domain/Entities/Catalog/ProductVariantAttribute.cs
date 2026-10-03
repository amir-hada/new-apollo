namespace ApolloShop.Domain.Entities.Catalog;

public class ProductVariantAttribute
{
    public Guid VariantId { get; set; }
    public Guid AttributeValueId { get; set; }

    public ProductVariant Variant { get; set; } = null!;
    public ProductAttributeValue AttributeValue { get; set; } = null!;
}
