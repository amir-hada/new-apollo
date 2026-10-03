using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;

namespace Apollo.Infrastructure.Identity;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? NationalId { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
