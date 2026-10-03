using Apollo.Domain.Constants;

namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class Plan
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ImageFileId { get; set; }

    public string Description { get; set; } = string.Empty;

    public long PriceInToman { get; set; }

    public long? DiscountedPriceInToman { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool AllowsInstallment { get; set; }

    public bool IsPublished { get; set; }

    public string BillingPeriod { get; set; } = PlanBillingPeriod.Monthly;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<PlanProperty> Properties { get; set; } = [];

    public ICollection<PlanTemplate> Templates { get; set; } = [];
}
