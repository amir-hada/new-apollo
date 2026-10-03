using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Commerce;

public class Cart : Entity
{
    public Guid? UserId { get; set; }
    public string? GuestToken { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
