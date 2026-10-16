using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductSpecificationValue : Entity
{
    public Guid SpecificationId { get; set; }
    public string Value { get; set; } = string.Empty;
    /// <summary>کد رنگ اختیاری (مثل #1e3a8a) برای نمایش سواچ در فروشگاه.</summary>
    public string? ColorHex { get; set; }
    /// <summary>تغییر قیمت نسبت به قیمت فروش محصول (می‌تواند صفر، مثبت یا منفی باشد).</summary>
    public decimal PriceAdjustment { get; set; }
    public int SortOrder { get; set; }

    public ProductSpecification Specification { get; set; } = null!;
}
