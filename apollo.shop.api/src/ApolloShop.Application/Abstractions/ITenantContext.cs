namespace ApolloShop.Application.Abstractions;

public interface ITenantContext
{
    Guid TenantId { get; }
    string? Slug { get; }
    bool IsResolved { get; }
    bool IsBypassed { get; }
    void Set(Guid tenantId, string slug);
    void Bypass();
}
