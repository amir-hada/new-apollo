using ApolloShop.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ApolloShop.Persistence.Configurations;

public class ShopSettingsConfiguration : IEntityTypeConfiguration<ShopSettings>
{
    public void Configure(EntityTypeBuilder<ShopSettings> builder)
    {
        builder.ToTable("ShopSettings");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ShopTitle).HasMaxLength(200).IsRequired();
        builder.Property(x => x.BrowserTitle).HasMaxLength(200).IsRequired();
        builder.Property(x => x.LogoUrl).HasMaxLength(1000);
        builder.Property(x => x.FavIconUrl).HasMaxLength(1000);
        builder.Property(x => x.Currency).HasMaxLength(50).IsRequired();
        builder.Property(x => x.SupportPhone).HasMaxLength(50);
        builder.Property(x => x.SupportEmail).HasMaxLength(256);
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.MetaDescription).HasMaxLength(500);
        builder.Property(x => x.PrimaryColor).HasMaxLength(20);
        builder.Property(x => x.CreatedBy).HasMaxLength(256);
        builder.Property(x => x.UpdatedBy).HasMaxLength(256);
    }
}
