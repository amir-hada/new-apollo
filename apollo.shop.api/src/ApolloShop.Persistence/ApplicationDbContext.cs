using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Entities.Content;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Common;
using ApolloShop.Domain.Entities.Support;
using ApolloShop.Domain.Entities.Tenancy;
using ApolloShop.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly AuditableEntityInterceptor _auditableEntityInterceptor;
    private readonly ITenantContext _tenantContext;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditableEntityInterceptor auditableEntityInterceptor,
        ITenantContext tenantContext)
        : base(options)
    {
        _auditableEntityInterceptor = auditableEntityInterceptor;
        _tenantContext = tenantContext;
    }

    // Evaluated per query by EF (instance members of the context are parameterized in query filters).
    private bool TenantBypassed => _tenantContext.IsBypassed;
    private Guid CurrentTenantId => _tenantContext.IsResolved ? _tenantContext.TenantId : Guid.Empty;

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<ShopSsoCode> ShopSsoCodes => Set<ShopSsoCode>();

    public IQueryable<Product> ProductsIncludingDeleted =>
        Products.IgnoreQueryFilters().Where(p => TenantBypassed || p.TenantId == CurrentTenantId);

    public IQueryable<BlogPost> BlogPostsIncludingDeleted =>
        BlogPosts.IgnoreQueryFilters().Where(p => TenantBypassed || p.TenantId == CurrentTenantId);

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PhoneOtp> PhoneOtps => Set<PhoneOtp>();

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<ProductAttributeValue> ProductAttributeValues => Set<ProductAttributeValue>();
    public DbSet<ProductVariantAttribute> ProductVariantAttributes => Set<ProductVariantAttribute>();
    public DbSet<ProductSpecification> ProductSpecifications => Set<ProductSpecification>();
    public DbSet<ProductSpecificationValue> ProductSpecificationValues => Set<ProductSpecificationValue>();
    public DbSet<ProductView> ProductViews => Set<ProductView>();
    public DbSet<ProductLike> ProductLikes => Set<ProductLike>();
    public DbSet<ProductComment> ProductComments => Set<ProductComment>();

    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogTag> BlogTags => Set<BlogTag>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<BlogPostTag> BlogPostTags => Set<BlogPostTag>();
    public DbSet<ShopSettings> ShopSettings => Set<ShopSettings>();

    public DbSet<TicketCategory> TicketCategories => Set<TicketCategory>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
    public DbSet<TicketAttachment> TicketAttachments => Set<TicketAttachment>();

    public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
                     .Where(t => typeof(ITenantScoped).IsAssignableFrom(t.ClrType))
                     .ToList())
        {
            modelBuilder.Entity(entityType.ClrType)
                .HasOne(typeof(Tenant))
                .WithMany()
                .HasForeignKey(nameof(ITenantScoped.TenantId))
                .OnDelete(DeleteBehavior.Restrict);
        }

        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted && (TenantBypassed || u.TenantId == CurrentTenantId));
        modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted && (TenantBypassed || p.TenantId == CurrentTenantId));
        modelBuilder.Entity<BlogPost>().HasQueryFilter(p => !p.IsDeleted && (TenantBypassed || p.TenantId == CurrentTenantId));

        ApplyTenantFilter<PhoneOtp>(modelBuilder);
        ApplyTenantFilter<Category>(modelBuilder);
        ApplyTenantFilter<Brand>(modelBuilder);
        ApplyTenantFilter<ProductVariant>(modelBuilder);
        ApplyTenantFilter<ProductAttribute>(modelBuilder);
        ApplyTenantFilter<Cart>(modelBuilder);
        ApplyTenantFilter<Order>(modelBuilder);
        ApplyTenantFilter<Address>(modelBuilder);
        ApplyTenantFilter<Coupon>(modelBuilder);
        ApplyTenantFilter<ShopSettings>(modelBuilder);
        ApplyTenantFilter<BlogCategory>(modelBuilder);
        ApplyTenantFilter<BlogTag>(modelBuilder);
        ApplyTenantFilter<TicketCategory>(modelBuilder);
        ApplyTenantFilter<Ticket>(modelBuilder);
        ApplyTenantFilter<ChatConversation>(modelBuilder);
        ApplyTenantFilter<ChatMessage>(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }

    private void ApplyTenantFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantScoped
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => TenantBypassed || e.TenantId == CurrentTenantId);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyTenantId();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ApplyTenantId();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyTenantId()
    {
        if (!_tenantContext.IsResolved)
        {
            return;
        }

        foreach (var entry in ChangeTracker.Entries<ITenantScoped>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                entry.Entity.TenantId = _tenantContext.TenantId;
            }
        }
    }
}
