using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;

namespace ApolloShop.Domain.Entities.Commerce;

public class Address : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public bool IsDefault { get; set; }

    public User User { get; set; } = null!;
}
