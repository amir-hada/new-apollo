using Apollo.Infrastructure.Identity;

namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class LoginHistory
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public DateTime LoggedInAtUtc { get; set; }

    public string IpAddress { get; set; } = string.Empty;

    public string UserAgent { get; set; } = string.Empty;
}
