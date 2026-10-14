namespace ApolloShop.Domain.Entities.Identity;

public static class WellKnownRoles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";
    public const string PlatformAdmin = "PlatformAdmin";

    public static readonly Guid AdminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid CustomerId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid PlatformAdminId = Guid.Parse("44444444-4444-4444-4444-444444444444");
}
