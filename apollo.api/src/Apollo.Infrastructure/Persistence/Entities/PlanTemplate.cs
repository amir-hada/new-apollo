namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class PlanTemplate
{
    public Guid Id { get; set; }

    public Guid PlanId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string ImageFileId { get; set; } = string.Empty;

    public Plan Plan { get; set; } = null!;
}
