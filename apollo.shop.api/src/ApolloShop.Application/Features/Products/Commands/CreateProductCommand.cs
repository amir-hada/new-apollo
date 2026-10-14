using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Commands;

public record CreateProductCommand(CreateProductRequest Request) : IRequest<ProductDetailDto>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public CreateProductCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<ProductDetailDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var r = request.Request;
        var slug = ProductWriteHelper.ResolveSlug(r.Slug, r.Name);
        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new ValidationException("Slug", "Product slug is required.");
        }
        if (await _db.ProductsIncludingDeleted.AnyAsync(p => p.Slug == slug, cancellationToken))
        {
            throw new ConflictException("Product slug already exists.");
        }

        var productCode = await ProductWriteHelper.NextProductCodeAsync(_db, cancellationToken);
        // SKU اختیاری است؛ فقط اگر کاربر مقدار داده باشد ذخیره می‌شود.
        var sku = string.IsNullOrWhiteSpace(r.Sku) ? null : r.Sku.Trim();

        if (sku is not null
            && await _db.ProductsIncludingDeleted.AnyAsync(p => p.Sku == sku, cancellationToken))
        {
            throw new ConflictException("Product SKU already exists.");
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = r.Name.Trim(),
            Slug = slug,
            Description = r.Description,
            BrandId = r.BrandId,
            CategoryId = r.CategoryId,
            IsAvailable = false,
            Status = ProductStatus.Draft,
            ProductCode = productCode,
            Sku = sku,
            BasePrice = r.BasePrice,
            DiscountPrice = r.DiscountPrice,
            StockQuantity = r.TrackInventory ? Math.Max(0, r.StockQuantity) : 0,
            TrackInventory = r.TrackInventory,
            ShowStockInStore = r.TrackInventory && r.ShowStockInStore,
            StockDisplayThreshold = r.TrackInventory && r.ShowStockInStore ? r.StockDisplayThreshold : null,
            MinOrderQuantity = r.TrackInventory ? Math.Max(1, r.MinOrderQuantity) : 1,
            MaxOrderQuantity = r.TrackInventory ? r.MaxOrderQuantity : null,
            SeoTitle = ProductWriteHelper.TrimSeo(r.SeoTitle, 250),
            SeoDescription = ProductWriteHelper.TrimSeo(r.SeoDescription, 500),
            SeoKeywords = ProductWriteHelper.TrimSeo(r.SeoKeywords, 500),
            FocusKeyword = ProductWriteHelper.TrimSeo(r.FocusKeyword, 120),
            CanonicalUrl = ProductWriteHelper.TrimSeo(r.CanonicalUrl, 1000),
            RobotsNoIndex = r.RobotsNoIndex,
            RobotsNoFollow = r.RobotsNoFollow,
            OgTitle = ProductWriteHelper.TrimSeo(r.OgTitle, 250),
            OgDescription = ProductWriteHelper.TrimSeo(r.OgDescription, 500),
            OgImageUrl = ProductWriteHelper.TrimSeo(r.OgImageUrl, 1000),
            CreatedAtUtc = _clock.UtcNow
        };

        ProductWriteHelper.ApplyImagesAndSpecs(product, r.Images, r.Specs, replaceExisting: false);
        ProductWriteHelper.SyncDefaultVariant(product);
        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await Queries.ProductMapper.LoadAsync(_db, product.Id.ToString(), bySlug: false, cancellationToken)
            ?? throw new NotFoundException("Product", product.Id);
        return Queries.ProductMapper.ToDetail(loaded);
    }
}
