using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Enums;

namespace ApolloShop.Domain.Entities.Content;

public class BlogPost : AuditableEntity, ISoftDeletable, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;
    public DateTime? PublishedAtUtc { get; set; }
    public Guid AuthorUserId { get; set; }
    public Guid? CategoryId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }

    public User Author { get; set; } = null!;
    public BlogCategory? Category { get; set; }
    public ICollection<BlogPostTag> PostTags { get; set; } = new List<BlogPostTag>();
}
