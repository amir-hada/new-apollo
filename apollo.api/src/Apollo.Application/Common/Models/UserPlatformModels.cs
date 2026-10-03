namespace Apollo.Application.Common.Models;

public sealed record UserPlatformListItemDto(
    Guid PlatformId,
    Guid PlanId,
    string PlanName,
    string Name,
    DateTime CreatedAtUtc);

public sealed record CreateUserPlatformRequest(
    Guid PlanId,
    string Name);

public sealed record UpdatePlatformSettingsRequest(
    string WebsiteName,
    string WebsiteLogoFileId,
    string AdminUsername,
    string AdminPassword,
    string TemplateCode);

public sealed record PlatformSettingsDto(
    string WebsiteName,
    string WebsiteLogoFileId,
    string? WebsiteLogoUrl,
    string AdminUsername,
    string AdminPassword,
    string TemplateCode);

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
    IReadOnlyList<PlatformTemplateOptionDto> AvailableTemplates);

public sealed record PlanOptionDto(
    Guid PlanId,
    string Name,
    string? ImageUrl,
    long PriceInToman,
    long? DiscountedPriceInToman,
    string BillingPeriod,
    bool IsAvailable);
