using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductLike : Entity
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public Product Product { get; set; } = null!;
}
