namespace Apollo.Application.Abstractions.Shop;

public sealed record ShopCreateTenantRequest(
    string Slug,
    string Name,
    string AdminEmail,
    string AdminPassword,
    string AdminFirstName,
    string AdminLastName,
    string? ShopTitle = null,
    string? PrimaryColor = null,
    Guid? ExternalOwnerId = null);

public sealed record ShopCreateTenantResult(
    Guid TenantId,
    string Slug,
    string Name,
    string AdminEmail);

public sealed record ShopSsoCodeResult(
    string Code,
    DateTime ExpiresAtUtc);

public sealed record ShopTenantStatusResult(
    Guid TenantId,
    string Slug,
    string Name,
    string? CustomDomain,
    bool IsActive,
    DateTime CreatedAtUtc);

public interface IShopProvisioningClient
{
    /// <exception cref="Apollo.Application.Common.Exceptions.ShopProvisioningException">Shop API rejected or was unreachable.</exception>
    Task<ShopCreateTenantResult> CreateTenantAsync(
        ShopCreateTenantRequest request,
        CancellationToken cancellationToken = default);

    /// <exception cref="Apollo.Application.Common.Exceptions.ShopProvisioningException">Shop API rejected or was unreachable.</exception>
    Task<ShopSsoCodeResult> CreateSsoCodeAsync(
        string slug,
        string email,
        CancellationToken cancellationToken = default);

    /// <exception cref="Apollo.Application.Common.Exceptions.ShopProvisioningException">Shop API rejected or was unreachable.</exception>
    Task<ShopTenantStatusResult> SetTenantActiveAsync(
        string slug,
        bool isActive,
        CancellationToken cancellationToken = default);

    /// <summary>Deletes the shop tenant and all of its data. Idempotent if the tenant is already gone.</summary>
    /// <exception cref="Apollo.Application.Common.Exceptions.ShopProvisioningException">Shop API rejected or was unreachable.</exception>
    Task DeleteTenantAsync(
        string slug,
        CancellationToken cancellationToken = default);

    /// <summary>Builds the public storefront URL for a tenant slug.</summary>
    string BuildStorefrontUrl(string slug);

    /// <summary>Builds the shop admin URL for a tenant slug (no SSO code).</summary>
    string BuildAdminUrl(string slug);
}
