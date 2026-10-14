using ApolloShop.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ApolloShop.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.CreatedBy).HasMaxLength(256);
        builder.Property(x => x.UpdatedBy).HasMaxLength(256);

        builder.HasIndex(x => new { x.TenantId, x.Slug }).IsUnique();

        builder.HasOne(x => x.Parent)
            .WithMany(x => x.Children)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("Brands");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.ImagePath).HasMaxLength(1000);
        builder.Property(x => x.CreatedBy).HasMaxLength(256);
        builder.Property(x => x.UpdatedBy).HasMaxLength(256);

        builder.HasIndex(x => new { x.TenantId, x.Slug }).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Description).IsRequired();
        builder.Property(x => x.ProductCode).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Sku).HasMaxLength(100);
        builder.Property(x => x.BasePrice).HasPrecision(18, 2);
        builder.Property(x => x.DiscountPrice).HasPrecision(18, 2);
        builder.Property(x => x.SeoTitle).HasMaxLength(250);
        builder.Property(x => x.SeoDescription).HasMaxLength(500);
        builder.Property(x => x.SeoKeywords).HasMaxLength(500);
        builder.Property(x => x.FocusKeyword).HasMaxLength(120);
        builder.Property(x => x.CanonicalUrl).HasMaxLength(1000);
        builder.Property(x => x.OgTitle).HasMaxLength(250);
        builder.Property(x => x.OgDescription).HasMaxLength(500);
        builder.Property(x => x.OgImageUrl).HasMaxLength(1000);
        builder.Property(x => x.CreatedBy).HasMaxLength(256);
        builder.Property(x => x.UpdatedBy).HasMaxLength(256);
        builder.Property(x => x.DeletedBy).HasMaxLength(256);

        builder.HasIndex(x => new { x.TenantId, x.Slug }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.ProductCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Sku })
            .IsUnique()
            .HasFilter("[Sku] IS NOT NULL AND [Sku] <> ''");

        builder.HasOne(x => x.Brand)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Category)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Images)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Variants)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Specs)
            .WithOne(x => x.Product)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");

        builder.HasKey(x => x.Id);
        // Client-assigned Guids; without this, Add via navigation is treated as UPDATE.
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.ImagePath).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.AlternativeText).HasMaxLength(300);
        builder.Property(x => x.MediaKind).HasConversion<int>();
    }
}

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("ProductVariants");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Sku).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.CompareAtPrice).HasPrecision(18, 2);

        // Product.Sku is the canonical unique code; default variant mirrors it for cart.
        builder.HasIndex(x => x.Sku);
    }
}

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("ProductAttributes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.DisplayName).HasMaxLength(150).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();

        builder.HasMany(x => x.Values)
            .WithOne(x => x.Attribute)
            .HasForeignKey(x => x.AttributeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
{
    public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
    {
        builder.ToTable("ProductAttributeValues");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Value).HasMaxLength(200).IsRequired();
    }
}

public class ProductVariantAttributeConfiguration : IEntityTypeConfiguration<ProductVariantAttribute>
{
    public void Configure(EntityTypeBuilder<ProductVariantAttribute> builder)
    {
        builder.ToTable("ProductVariantAttributes");

        builder.HasKey(x => new { x.VariantId, x.AttributeValueId });

        builder.HasOne(x => x.Variant)
            .WithMany(x => x.VariantAttributes)
            .HasForeignKey(x => x.VariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.AttributeValue)
            .WithMany(x => x.VariantAttributes)
            .HasForeignKey(x => x.AttributeValueId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class ProductSpecificationConfiguration : IEntityTypeConfiguration<ProductSpecification>
{
    public void Configure(EntityTypeBuilder<ProductSpecification> builder)
    {
        builder.ToTable("ProductSpecifications");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();

        builder.HasMany(x => x.Values)
            .WithOne(x => x.Specification)
            .HasForeignKey(x => x.SpecificationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductSpecificationValueConfiguration : IEntityTypeConfiguration<ProductSpecificationValue>
{
    public void Configure(EntityTypeBuilder<ProductSpecificationValue> builder)
    {
        builder.ToTable("ProductSpecificationValues");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Value).HasMaxLength(500).IsRequired();
        builder.Property(x => x.PriceAdjustment).HasPrecision(18, 2);
    }
}

public class ProductViewConfiguration : IEntityTypeConfiguration<ProductView>
{
    public void Configure(EntityTypeBuilder<ProductView> builder)
    {
        builder.ToTable("ProductViews");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.GuestToken).HasMaxLength(100);
        builder.HasIndex(x => new { x.ProductId, x.CreatedAtUtc });
        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductLikeConfiguration : IEntityTypeConfiguration<ProductLike>
{
    public void Configure(EntityTypeBuilder<ProductLike> builder)
    {
        builder.ToTable("ProductLikes");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.ProductId, x.UserId }).IsUnique();
        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductCommentConfiguration : IEntityTypeConfiguration<ProductComment>
{
    public void Configure(EntityTypeBuilder<ProductComment> builder)
    {
        builder.ToTable("ProductComments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Body).HasMaxLength(2000).IsRequired();
        builder.HasIndex(x => new { x.ProductId, x.CreatedAtUtc });
        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
