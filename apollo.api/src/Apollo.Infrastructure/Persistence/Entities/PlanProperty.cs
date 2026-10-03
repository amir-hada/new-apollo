namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class PlanProperty
{
    public Guid Id { get; set; }

    public Guid PlanId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public Plan Plan { get; set; } = null!;
}
