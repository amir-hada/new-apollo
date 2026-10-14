using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Identity;

public class PhoneOtp : ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? ConsumedAtUtc { get; set; }
    public int AttemptCount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string Purpose { get; set; } = "login";
}
