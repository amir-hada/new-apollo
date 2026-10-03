namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class PlatformConfiguration
{
    public Guid Id { get; set; }

    public Guid PlatformId { get; set; }

    public string WebsiteName { get; set; } = string.Empty;

    public string WebsiteLogoFileId { get; set; } = string.Empty;

    public string AdminUsername { get; set; } = string.Empty;

    public string AdminPassword { get; set; } = string.Empty;

    public string TemplateCode { get; set; } = string.Empty;

    public UserPlatform Platform { get; set; } = null!;
}
