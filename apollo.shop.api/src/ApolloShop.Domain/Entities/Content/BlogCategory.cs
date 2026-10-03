using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Content;

public class BlogCategory : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<BlogPost> Posts { get; set; } = new List<BlogPost>();
}
