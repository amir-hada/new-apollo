namespace Apollo.Infrastructure.Persistence.Entities;

using Apollo.Infrastructure.Identity;

public sealed class StoredFile
{
    public Guid Id { get; set; }

    public Guid OwnerUserId { get; set; }

    public string ObjectKey { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public string Purpose { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }

    public ApplicationUser? Owner { get; set; }
}
