namespace Apollo.Infrastructure.Options;

public sealed class ShopIntegrationOptions
{
    public const string SectionName = "Shop";

    /// <summary>apollo.shop.api base URL (server-to-server).</summary>
    public string BaseUrl { get; set; } = "http://localhost:5080";

    /// <summary>Value sent in X-Provisioning-Key; must match Provisioning:ApiKey in apollo.shop.api.</summary>
    public string ProvisioningKey { get; set; } = string.Empty;

    /// <summary>Base URL of the shop frontend; tenant sites are served at {slug}.{host}.</summary>
    public string StorefrontBaseUrl { get; set; } = "http://localhost:3000";

    public string AdminPath { get; set; } = "/admin";
}
