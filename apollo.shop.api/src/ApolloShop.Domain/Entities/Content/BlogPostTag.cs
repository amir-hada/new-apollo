namespace ApolloShop.Domain.Entities.Content;

public class BlogPostTag
{
    public Guid PostId { get; set; }
    public Guid TagId { get; set; }

    public BlogPost Post { get; set; } = null!;
    public BlogTag Tag { get; set; } = null!;
}
