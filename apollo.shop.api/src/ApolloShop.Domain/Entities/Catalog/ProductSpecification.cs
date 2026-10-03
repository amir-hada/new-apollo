using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductSpecification : Entity
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>اگر true باشد و چند مقدار داشته باشد، خریدار هنگام سفارش یکی را انتخاب می‌کند.</summary>
    public bool IsOrderParameter { get; set; }
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
    public ICollection<ProductSpecificationValue> Values { get; set; } = new List<ProductSpecificationValue>();
}
