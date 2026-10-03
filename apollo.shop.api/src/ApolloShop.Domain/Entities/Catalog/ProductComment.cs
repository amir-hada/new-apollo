using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductComment : Entity
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public string Body { get; set; } = string.Empty;
    /// <summary>اختیاری؛ امتیاز ۱ تا ۵.</summary>
    public int? Rating { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }

    public Product Product { get; set; } = null!;
}
