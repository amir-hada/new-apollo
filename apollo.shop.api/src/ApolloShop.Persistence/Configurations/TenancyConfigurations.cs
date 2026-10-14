using ApolloShop.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ApolloShop.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Slug).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CustomDomain).HasMaxLength(255);

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.CustomDomain)
            .IsUnique()
            .HasFilter("[CustomDomain] IS NOT NULL");
        builder.HasIndex(x => x.ExternalOwnerId);
    }
}

public class ShopSsoCodeConfiguration : IEntityTypeConfiguration<ShopSsoCode>
{
    public void Configure(EntityTypeBuilder<ShopSsoCode> builder)
    {
        builder.ToTable("ShopSsoCodes");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.CodeHash).HasMaxLength(64).IsRequired();
        builder.Property(x => x.UserEmail).HasMaxLength(256).IsRequired();

        builder.HasIndex(x => x.CodeHash).IsUnique();
        builder.HasIndex(x => x.ExpiresAtUtc);

        builder.HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
