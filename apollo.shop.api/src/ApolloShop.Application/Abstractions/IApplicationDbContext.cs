using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Entities.Content;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Support;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<PhoneOtp> PhoneOtps { get; }

    DbSet<Category> Categories { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<ProductAttribute> ProductAttributes { get; }
    DbSet<ProductAttributeValue> ProductAttributeValues { get; }
    DbSet<ProductVariantAttribute> ProductVariantAttributes { get; }
    DbSet<ProductSpecification> ProductSpecifications { get; }
    DbSet<ProductSpecificationValue> ProductSpecificationValues { get; }
    DbSet<ProductView> ProductViews { get; }
    DbSet<ProductLike> ProductLikes { get; }
    DbSet<ProductComment> ProductComments { get; }

    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Address> Addresses { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Coupon> Coupons { get; }

    DbSet<BlogCategory> BlogCategories { get; }
    DbSet<BlogTag> BlogTags { get; }
    DbSet<BlogPost> BlogPosts { get; }
    DbSet<BlogPostTag> BlogPostTags { get; }
    DbSet<ShopSettings> ShopSettings { get; }

    DbSet<TicketCategory> TicketCategories { get; }
    DbSet<Ticket> Tickets { get; }
    DbSet<TicketMessage> TicketMessages { get; }
    DbSet<TicketAttachment> TicketAttachments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
