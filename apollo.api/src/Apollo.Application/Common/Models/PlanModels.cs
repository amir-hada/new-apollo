namespace Apollo.Application.Common.Models;

public sealed record PlanPropertyDto(
    string Title,
    string Value);

public sealed record PlanTemplateDto(
    string Title,
    string Code,
    string ImageFileId,
    string? ImageUrl = null);

public sealed record AdminPlanListItemDto(
    Guid PlanId,
    string Name,
    string? ImageUrl,
    string? ImageFileId,
    string Description,
    long PriceInToman,
    long? DiscountedPriceInToman,
    bool IsAvailable,
    bool AllowsInstallment,
    bool IsPublished,
    string BillingPeriod,
    IReadOnlyList<PlanPropertyDto> Properties,
    IReadOnlyList<PlanTemplateDto> Templates,
    DateTime CreatedAtUtc);

public sealed record CreatePlanRequest(
    string Name,
    string? ImageFileId,
    string Description,
    long PriceInToman,
    long? DiscountedPriceInToman,
    bool IsAvailable,
    bool AllowsInstallment,
    string BillingPeriod);

public sealed record UpdatePlanRequest(
    string Name,
    string? ImageFileId,
    string Description,
    long PriceInToman,
    long? DiscountedPriceInToman,
    bool IsAvailable,
    bool AllowsInstallment,
    bool IsPublished,
    string BillingPeriod,
    IReadOnlyList<PlanPropertyDto> Properties,
    IReadOnlyList<PlanTemplateDto> Templates);

public sealed record PublicPlanListItemDto(
    Guid PlanId,
    string Name,
    string? ImageUrl,
    string Description,
    long PriceInToman,
    long? DiscountedPriceInToman,
    bool IsAvailable,
    bool AllowsInstallment,
    string BillingPeriod,
    IReadOnlyList<PlanPropertyDto> Properties);
