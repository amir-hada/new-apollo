namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class UserPlatform
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid PlanId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public Plan Plan { get; set; } = null!;

    public PlatformConfiguration? Configuration { get; set; }
}
