using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Tenancy;

public class Tenant : Entity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CustomDomain { get; set; }
    /// <summary>Owner id in the Apollo platform (UserPlatform owner), set when provisioned internally.</summary>
    public Guid? ExternalOwnerId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
}
