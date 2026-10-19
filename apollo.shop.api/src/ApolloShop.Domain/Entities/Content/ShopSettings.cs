using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Content;

/// <summary>Singleton store configuration row.</summary>
public class ShopSettings : AuditableEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string ShopTitle { get; set; } = string.Empty;

    /// <summary>Title shown in the browser tab next to the favicon.</summary>
    public string BrowserTitle { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }
    public string? FavIconUrl { get; set; }
    public string Currency { get; set; } = "تومان";
    public string? SupportPhone { get; set; }
    public string? SupportEmail { get; set; }
    public string? Address { get; set; }
    public string? Description { get; set; }
    public string? MetaDescription { get; set; }

    /// <summary>Hex primary brand color, e.g. #0f172a.</summary>
    public string? PrimaryColor { get; set; }

    /// <summary>
    /// Store vertical key used for storefront presets (header links, return policy, etc.).
    /// Matches test-data topic keys: clothing, mobile, cosmetics, home, …
    /// </summary>
    public string? IndustryKey { get; set; }

    /// <summary>JSON array of hero banner slides for the storefront homepage.</summary>
    public string? HeroBannersJson { get; set; }

    /// <summary>JSON array of homepage story circles.</summary>
    public string? HomeStoriesJson { get; set; }

    /// <summary>When true, login/register OTP SMS is sent via the shared Apollo SMS panel.</summary>
    public bool SmsOtpEnabled { get; set; } = true;

    /// <summary>When true, an SMS is sent to the customer after placing an order.</summary>
    public bool SmsOrderEnabled { get; set; } = true;

    /// <summary>When true, flat shipping fee is applied to orders (unless free-shipping threshold is met).</summary>
    public bool ShippingEnabled { get; set; } = true;

    /// <summary>Fixed shipping fee in shop currency units (e.g. toman).</summary>
    public decimal FlatShippingRate { get; set; } = 50_000m;

    /// <summary>
    /// Subtotal (after discount) at or above which shipping is free.
    /// Null or zero means free-shipping threshold is disabled.
    /// </summary>
    public decimal? FreeShippingThreshold { get; set; } = 500_000m;

    /// <summary>Optional note shown to customers about shipping.</summary>
    public string? ShippingCustomerNote { get; set; }
}
