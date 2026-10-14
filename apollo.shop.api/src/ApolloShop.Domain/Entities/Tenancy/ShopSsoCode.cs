using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Tenancy;

/// <summary>One-time code issued by the Apollo platform to sign a tenant admin into the shop admin panel.</summary>
public class ShopSsoCode : Entity
{
    /// <summary>SHA-256 (hex) of the plain code; the plain code is never stored.</summary>
    public string CodeHash { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? UsedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
