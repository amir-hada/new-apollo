using Apollo.Domain.Constants;

namespace Apollo.Application.Common.Models;

public sealed record UserPlatformListItemDto(
    Guid PlatformId,
    Guid PlanId,
    string PlanName,
    string Name,
    DateTime CreatedAtUtc,
    PlanProductType ProductType,
    Guid? TenantId,
    string? TenantSlug,
    string? StorefrontUrl,
    string? AdminUrl,
    SiteProvisioningStatus ProvisioningStatus,
    string? ProvisioningError);

public sealed record CreateUserPlatformRequest(
    Guid PlanId,
    string Name,
    string? Slug = null);

public sealed record UpdatePlatformSettingsRequest(
    string WebsiteName,
    string WebsiteLogoFileId,
    string AdminUsername,
    string AdminPassword,
    string TemplateCode,
    string? Slug = null);

public sealed record PlatformSettingsDto(
    string WebsiteName,
    string WebsiteLogoFileId,
    string? WebsiteLogoUrl,
    string AdminUsername,
    string AdminPassword,
    string TemplateCode,
    string? Slug = null);

public sealed record PlatformTemplateOptionDto(
    string Code,
    string Title,
    string? ImageUrl);

public sealed record UserPlatformDetailDto(
    Guid PlatformId,
    Guid PlanId,
    string PlanName,
    string Name,
    DateTime CreatedAtUtc,
    PlatformSettingsDto Settings,
    IReadOnlyList<PlatformTemplateOptionDto> AvailableTemplates,
    PlanProductType ProductType,
    Guid? TenantId,
    string? TenantSlug,
    string? StorefrontUrl,
    string? AdminUrl,
    SiteProvisioningStatus ProvisioningStatus,
    string? ProvisioningError);

public sealed record PlanOptionDto(
    Guid PlanId,
    string Name,
    string? ImageUrl,
    long PriceInToman,
    long? DiscountedPriceInToman,
    string BillingPeriod,
    bool IsAvailable,
    PlanProductType ProductType = PlanProductType.Shop);

public sealed record ShopSsoRedirectDto(string RedirectUrl);

public sealed record AdminSiteListItemDto(
    Guid PlatformId,
    Guid UserId,
    string? UserEmail,
    string? UserPhoneNumber,
    string UserFullName,
    Guid PlanId,
    string PlanName,
    PlanProductType ProductType,
    string Name,
    string? Slug,
    Guid? TenantId,
    string? StorefrontUrl,
    string? AdminUrl,
    SiteProvisioningStatus ProvisioningStatus,
    string? ProvisioningError,
    DateTime CreatedAtUtc);
