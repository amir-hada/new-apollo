using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Commands;

public record UpdateProductCommand(Guid Id, UpdateProductRequest Request) : IRequest<ProductDetailDto>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDetailDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateProductCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ProductDetailDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Specs)
                .ThenInclude(s => s.Values)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Product", request.Id);

        var r = request.Request;
        var slug = ProductWriteHelper.ResolveSlug(r.Slug, r.Name);
        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new ValidationException("Slug", "Product slug is required.");
        }
        if (await _db.ProductsIncludingDeleted.AnyAsync(p => p.Slug == slug && p.Id != product.Id, cancellationToken))
        {
            throw new ConflictException("Product slug already exists.");
        }

        var sku = string.IsNullOrWhiteSpace(r.Sku) ? null : r.Sku.Trim();
        if (sku is not null
            && await _db.ProductsIncludingDeleted
                .AnyAsync(p => p.Sku == sku && p.Id != product.Id, cancellationToken))
        {
            throw new ConflictException("Product SKU already exists.");
        }

        product.Name = r.Name.Trim();
        product.Slug = slug;
        product.Description = r.Description;
        product.BrandId = r.BrandId;
        product.CategoryId = r.CategoryId;
        product.IsAvailable = r.IsAvailable;
        product.Status = r.Status;
        product.Sku = sku;
        product.BasePrice = r.BasePrice;
        product.DiscountPrice = r.DiscountPrice;
        product.TrackInventory = r.TrackInventory;
        if (r.TrackInventory)
        {
            product.StockQuantity = Math.Max(0, r.StockQuantity);
            product.ShowStockInStore = r.ShowStockInStore;
            product.StockDisplayThreshold = r.ShowStockInStore ? r.StockDisplayThreshold : null;
            product.MinOrderQuantity = Math.Max(1, r.MinOrderQuantity);
            product.MaxOrderQuantity = r.MaxOrderQuantity;
            if (product.StockQuantity <= 0)
            {
                product.IsAvailable = false;
            }
        }
        else
        {
            product.ShowStockInStore = false;
            product.StockDisplayThreshold = null;
            product.MinOrderQuantity = 1;
            product.MaxOrderQuantity = null;
        }

        product.SeoTitle = ProductWriteHelper.TrimSeo(r.SeoTitle, 250);
        product.SeoDescription = ProductWriteHelper.TrimSeo(r.SeoDescription, 500);
        product.SeoKeywords = ProductWriteHelper.TrimSeo(r.SeoKeywords, 500);
        product.FocusKeyword = ProductWriteHelper.TrimSeo(r.FocusKeyword, 120);
        product.CanonicalUrl = ProductWriteHelper.TrimSeo(r.CanonicalUrl, 1000);
        product.RobotsNoIndex = r.RobotsNoIndex;
        product.RobotsNoFollow = r.RobotsNoFollow;
        product.OgTitle = ProductWriteHelper.TrimSeo(r.OgTitle, 250);
        product.OgDescription = ProductWriteHelper.TrimSeo(r.OgDescription, 500);
        product.OgImageUrl = ProductWriteHelper.TrimSeo(r.OgImageUrl, 1000);

        ReplaceImages(product, r.Images);
        ReplaceSpecs(product, r.Specs);
        SyncDefaultVariant(product);

        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await Queries.ProductMapper.LoadAsync(_db, product.Id.ToString(), bySlug: false, cancellationToken)
            ?? throw new NotFoundException("Product", product.Id);
        return Queries.ProductMapper.ToDetail(loaded);
    }

    private void ReplaceImages(Product product, IReadOnlyList<UpsertProductImageRequest>? images)
    {
        if (product.Images.Count > 0)
        {
            _db.ProductImages.RemoveRange(product.Images);
            product.Images.Clear();
        }

        foreach (var image in images ?? [])
        {
            var entity = new ProductImage
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ImagePath = image.ImagePath,
                AlternativeText = image.AlternativeText,
                SortOrder = image.SortOrder,
                IsPrimary = image.IsPrimary,
                MediaKind = image.MediaKind
            };
            // Add via DbSet so EF treats client Guids as INSERT, not UPDATE.
            _db.ProductImages.Add(entity);
            product.Images.Add(entity);
        }
    }

    private void ReplaceSpecs(Product product, IReadOnlyList<UpsertProductSpecRequest>? specs)
    {
        if (product.Specs.Count > 0)
        {
            foreach (var existing in product.Specs)
            {
                if (existing.Values.Count > 0)
                {
                    _db.ProductSpecificationValues.RemoveRange(existing.Values);
                }
            }

            _db.ProductSpecifications.RemoveRange(product.Specs);
            product.Specs.Clear();
        }

        var sort = 0;
        foreach (var spec in specs ?? [])
        {
            var name = spec.Name.Trim();
            if (string.IsNullOrWhiteSpace(name)) continue;

            var values = (spec.Values ?? [])
                .Select(v => new { v.Value, v.PriceAdjustment, v.SortOrder, v.ColorHex })
                .Where(v => !string.IsNullOrWhiteSpace(v.Value))
                .OrderBy(v => v.SortOrder)
                .ToList();
            if (values.Count == 0) continue;

            sort += 1;
            var isOrderParameter = spec.IsOrderParameter && values.Count >= 2;
            var entity = new ProductSpecification
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Name = name,
                IsOrderParameter = isOrderParameter,
                SortOrder = sort
            };

            var valueSort = 0;
            foreach (var value in values)
            {
                valueSort += 1;
                var valueEntity = new ProductSpecificationValue
                {
                    Id = Guid.NewGuid(),
                    SpecificationId = entity.Id,
                    Value = value.Value.Trim(),
                    ColorHex = ProductWriteHelper.NormalizeColorHex(value.ColorHex),
                    PriceAdjustment = isOrderParameter ? value.PriceAdjustment : 0,
                    SortOrder = valueSort
                };
                _db.ProductSpecificationValues.Add(valueEntity);
                entity.Values.Add(valueEntity);
            }

            _db.ProductSpecifications.Add(entity);
            product.Specs.Add(entity);
        }
    }

    private void SyncDefaultVariant(Product product)
    {
        var variantSku = ProductWriteHelper.ResolveVariantSku(product);
        var variant = product.Variants.FirstOrDefault();
        if (variant is null)
        {
            var created = new ProductVariant
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Sku = variantSku,
                Name = "پیش‌فرض",
                Price = product.DiscountPrice ?? product.BasePrice,
                CompareAtPrice = product.DiscountPrice.HasValue ? product.BasePrice : null,
                StockQuantity = product.StockQuantity,
                IsActive = true
            };
            _db.ProductVariants.Add(created);
            product.Variants.Add(created);
            return;
        }

        variant.Sku = variantSku;
        variant.Price = product.DiscountPrice ?? product.BasePrice;
        variant.CompareAtPrice = product.DiscountPrice.HasValue ? product.BasePrice : null;
        variant.StockQuantity = product.StockQuantity;
        variant.IsActive = true;
    }
}
