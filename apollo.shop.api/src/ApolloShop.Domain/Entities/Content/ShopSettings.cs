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

    /// <summary>JSON array of hero banner slides for the storefront homepage.</summary>
    public string? HeroBannersJson { get; set; }

    /// <summary>JSON array of homepage story circles.</summary>
    public string? HomeStoriesJson { get; set; }
}
