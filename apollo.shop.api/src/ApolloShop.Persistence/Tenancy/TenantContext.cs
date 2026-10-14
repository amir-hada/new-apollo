using ApolloShop.Application.Abstractions;

namespace ApolloShop.Persistence.Tenancy;

public class TenantContext : ITenantContext
{
    public Guid TenantId { get; private set; }
    public string? Slug { get; private set; }
    public bool IsResolved { get; private set; }
    public bool IsBypassed { get; private set; }

    public void Set(Guid tenantId, string slug)
    {
        TenantId = tenantId;
        Slug = slug;
        IsResolved = true;
    }

    public void Bypass() => IsBypassed = true;
}
