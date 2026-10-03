using ApolloShop.Domain.Common;
using ApolloShop.Domain.Enums;

namespace ApolloShop.Domain.Entities.Catalog;

public class ProductImage : Entity
{
    public Guid ProductId { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public string? AlternativeText { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public ProductMediaKind MediaKind { get; set; } = ProductMediaKind.Image;

    public Product Product { get; set; } = null!;
}
