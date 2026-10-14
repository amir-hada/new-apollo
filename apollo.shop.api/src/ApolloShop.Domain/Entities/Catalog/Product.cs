using ApolloShop.Domain.Common;
using ApolloShop.Domain.Enums;

namespace ApolloShop.Domain.Entities.Catalog;

public class Product : AuditableEntity, ISoftDeletable, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? BrandId { get; set; }
    public Guid? CategoryId { get; set; }
    /// <summary>موجود برای فروش؛ اگر false باشد محصول در فروشگاه دیده می‌شود ولی قابل خرید نیست.</summary>
    public bool IsAvailable { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Draft;

    /// <summary>کد کالای اختصاصی مثل ۰۰۰۱</summary>
    public string ProductCode { get; set; } = string.Empty;
    /// <summary>اختیاری؛ اگر خالی باشد در فروشگاه/ادمین بدون SKU نمایش داده می‌شود.</summary>
    public string? Sku { get; set; }

    /// <summary>قیمت اصلی (الزامی).</summary>
    public decimal BasePrice { get; set; }
    /// <summary>قیمت با تخفیف (اختیاری؛ باید کمتر از قیمت اصلی باشد).</summary>
    public decimal? DiscountPrice { get; set; }

    public int StockQuantity { get; set; }
    /// <summary>فعال بودن انبار؛ در صورت false موجودی اعمال و کسر نمی‌شود.</summary>
    public bool TrackInventory { get; set; }
    /// <summary>نمایش تعداد باقی‌مانده در فروشگاه.</summary>
    public bool ShowStockInStore { get; set; }
    /// <summary>فقط وقتی موجودی به این مقدار یا کمتر برسد در فروشگاه نشان داده شود؛ null یعنی همیشه (در صورت روشن بودن نمایش).</summary>
    public int? StockDisplayThreshold { get; set; }
    public int MinOrderQuantity { get; set; } = 1;
    public int? MaxOrderQuantity { get; set; }

    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }
    /// <summary>کلمه کلیدی اصلی که صفحه حول آن بهینه‌سازی می‌شود.</summary>
    public string? FocusKeyword { get; set; }
    /// <summary>آدرس کنونیکال اختیاری؛ اگر خالی باشد مسیر پیش‌فرض محصول استفاده می‌شود.</summary>
    public string? CanonicalUrl { get; set; }
    public bool RobotsNoIndex { get; set; }
    public bool RobotsNoFollow { get; set; }
    public string? OgTitle { get; set; }
    public string? OgDescription { get; set; }
    public string? OgImageUrl { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }

    public Brand? Brand { get; set; }
    public Category? Category { get; set; }
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductSpecification> Specs { get; set; } = new List<ProductSpecification>();
}
