using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductView : Entity
{
    public Guid ProductId { get; set; }
    public Guid? UserId { get; set; }
    public string? GuestToken { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public Product Product { get; set; } = null!;
}
