using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Identity;

public class Permission : Entity
{
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
