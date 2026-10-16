using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Exceptions;
using ApolloShop.Domain.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tenancy.Commands;

public record DeleteTenantCommand(string Slug) : IRequest;

public sealed class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenantContext;

    public DeleteTenantCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    {
        _db = db;
        _tenantContext = tenantContext;
    }

    public async Task Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        _tenantContext.Bypass();

        var slug = request.Slug.Trim().ToLowerInvariant();
        if (slug == TenantIds.DefaultSlug)
        {
            throw new ConflictException("امکان حذف فروشگاه پیش‌فرض پلتفرم وجود ندارد.");
        }

        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Slug == slug, cancellationToken);

        // Idempotent: already gone
        if (tenant is null)
        {
            return;
        }

        if (tenant.Id == TenantIds.Default)
        {
            throw new ConflictException("امکان حذف فروشگاه پیش‌فرض پلتفرم وجود ندارد.");
        }

        var tid = tenant.Id;

        // Support
        await _db.ChatMessages.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.ChatConversations.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        var ticketIds = await _db.Tickets.Where(x => x.TenantId == tid).Select(x => x.Id).ToListAsync(cancellationToken);
        if (ticketIds.Count > 0)
        {
            var messageIds = await _db.TicketMessages
                .Where(m => ticketIds.Contains(m.TicketId))
                .Select(m => m.Id)
                .ToListAsync(cancellationToken);
            if (messageIds.Count > 0)
            {
                await _db.TicketAttachments
                    .Where(a => messageIds.Contains(a.MessageId))
                    .ExecuteDeleteAsync(cancellationToken);
            }

            await _db.TicketMessages
                .Where(m => ticketIds.Contains(m.TicketId))
                .ExecuteDeleteAsync(cancellationToken);
            await _db.Tickets.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        }

        await _db.TicketCategories.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        // Blog
        var blogPostIds = await _db.BlogPosts
            .IgnoreQueryFilters()
            .Where(x => x.TenantId == tid)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        if (blogPostIds.Count > 0)
        {
            await _db.BlogPostTags
                .Where(x => blogPostIds.Contains(x.PostId))
                .ExecuteDeleteAsync(cancellationToken);
        }

        await _db.BlogPosts.IgnoreQueryFilters().Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.BlogTags.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.BlogCategories.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        // Commerce (OrderItems/Payments cascade from Order; CartItems from Cart)
        await _db.Orders.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.Carts.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.Coupons.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.Addresses.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        // Catalog — clear FK blockers before products
        var productIds = await _db.Products
            .IgnoreQueryFilters()
            .Where(x => x.TenantId == tid)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        if (productIds.Count > 0)
        {
            await _db.ProductViews.Where(x => productIds.Contains(x.ProductId)).ExecuteDeleteAsync(cancellationToken);
            await _db.ProductLikes.Where(x => productIds.Contains(x.ProductId)).ExecuteDeleteAsync(cancellationToken);
            await _db.ProductComments.Where(x => productIds.Contains(x.ProductId)).ExecuteDeleteAsync(cancellationToken);

            var specIds = await _db.ProductSpecifications
                .Where(x => productIds.Contains(x.ProductId))
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);
            if (specIds.Count > 0)
            {
                await _db.ProductSpecificationValues
                    .Where(x => specIds.Contains(x.SpecificationId))
                    .ExecuteDeleteAsync(cancellationToken);
            }

            await _db.ProductSpecifications
                .Where(x => productIds.Contains(x.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
            await _db.ProductImages
                .Where(x => productIds.Contains(x.ProductId))
                .ExecuteDeleteAsync(cancellationToken);

            var variantIds = await _db.ProductVariants
                .Where(x => x.TenantId == tid || productIds.Contains(x.ProductId))
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);
            if (variantIds.Count > 0)
            {
                await _db.ProductVariantAttributes
                    .Where(x => variantIds.Contains(x.VariantId))
                    .ExecuteDeleteAsync(cancellationToken);
            }

            await _db.ProductVariants
                .Where(x => x.TenantId == tid || productIds.Contains(x.ProductId))
                .ExecuteDeleteAsync(cancellationToken);
        }

        await _db.Products.IgnoreQueryFilters().Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        var attributeIds = await _db.ProductAttributes
            .Where(x => x.TenantId == tid)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        if (attributeIds.Count > 0)
        {
            await _db.ProductAttributeValues
                .Where(x => attributeIds.Contains(x.AttributeId))
                .ExecuteDeleteAsync(cancellationToken);
        }

        await _db.ProductAttributes.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        await _db.Categories
            .Where(x => x.TenantId == tid)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.ParentId, (Guid?)null), cancellationToken);
        await _db.Categories.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.Brands.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        await _db.ShopSettings.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);
        await _db.PhoneOtps.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        // Users (UserRoles / RefreshTokens cascade)
        await _db.Users.IgnoreQueryFilters().Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        await _db.ShopSsoCodes.Where(x => x.TenantId == tid).ExecuteDeleteAsync(cancellationToken);

        _db.Tenants.Remove(tenant);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
