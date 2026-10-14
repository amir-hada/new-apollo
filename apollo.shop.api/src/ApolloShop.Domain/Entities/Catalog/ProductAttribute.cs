using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductAttribute : Entity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;

    public ICollection<ProductAttributeValue> Values { get; set; } = new List<ProductAttributeValue>();
}
