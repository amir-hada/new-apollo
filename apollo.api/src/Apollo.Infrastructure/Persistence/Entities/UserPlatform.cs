using Apollo.Domain.Constants;

namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class UserPlatform
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid PlanId { get; set; }

    public string Name { get; set; } = string.Empty;

    public Guid? TenantId { get; set; }

    public string? TenantSlug { get; set; }

    public string? StorefrontUrl { get; set; }

    public string? AdminUrl { get; set; }

    /// <summary>Email of the shop admin user created in the tenant (used for SSO).</summary>
    public string? TenantAdminEmail { get; set; }

    public SiteProvisioningStatus ProvisioningStatus { get; set; } = SiteProvisioningStatus.Pending;

    public string? ProvisioningError { get; set; }

    /// <summary>Whether the shop tenant is active (synced with shop <c>Tenant.IsActive</c>).</summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public Plan Plan { get; set; } = null!;

    public PlatformConfiguration? Configuration { get; set; }
}
