using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Content;

public class BlogTag : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public ICollection<BlogPostTag> PostTags { get; set; } = new List<BlogPostTag>();
}
