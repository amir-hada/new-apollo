namespace Apollo.Infrastructure.Persistence.Entities;

public sealed class PhoneOtp
{
    public Guid Id { get; set; }

    public string MobileNumber { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string Purpose { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public bool IsUsed { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;

    public bool IsActive => !IsUsed && !IsExpired;
}
