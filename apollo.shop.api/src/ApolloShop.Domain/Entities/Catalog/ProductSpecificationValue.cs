using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductSpecificationValue : Entity
{
    public Guid SpecificationId { get; set; }
    public string Value { get; set; } = string.Empty;
    /// <summary>تغییر قیمت نسبت به قیمت فروش محصول (می‌تواند صفر، مثبت یا منفی باشد).</summary>
    public decimal PriceAdjustment { get; set; }
    public int SortOrder { get; set; }

    public ProductSpecification Specification { get; set; } = null!;
}
