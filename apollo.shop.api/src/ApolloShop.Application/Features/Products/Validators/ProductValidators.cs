using ApolloShop.Application.Features.Products.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Products.Validators;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.Slug).MaximumLength(300);
        RuleFor(x => x.Request.Description).NotEmpty();
        RuleFor(x => x.Request.BasePrice).GreaterThan(0);
        RuleFor(x => x.Request.DiscountPrice)
            .GreaterThan(0)
            .When(x => x.Request.DiscountPrice.HasValue);
        RuleFor(x => x.Request.DiscountPrice)
            .LessThan(x => x.Request.BasePrice)
            .When(x => x.Request.DiscountPrice.HasValue)
            .WithMessage("Discount price must be less than the base price.");
        RuleFor(x => x.Request.StockQuantity).GreaterThanOrEqualTo(0).When(x => x.Request.TrackInventory);
        RuleFor(x => x.Request.MinOrderQuantity).GreaterThanOrEqualTo(1).When(x => x.Request.TrackInventory);
        RuleFor(x => x.Request.MaxOrderQuantity)
            .GreaterThanOrEqualTo(x => x.Request.MinOrderQuantity)
            .When(x => x.Request.TrackInventory && x.Request.MaxOrderQuantity.HasValue);
        RuleFor(x => x.Request.StockDisplayThreshold)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Request.TrackInventory && x.Request.ShowStockInStore && x.Request.StockDisplayThreshold.HasValue);
    }
}

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Request.Slug).MaximumLength(300);
        RuleFor(x => x.Request.Description).NotEmpty();
        RuleFor(x => x.Request.Sku).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.Request.Sku));
        RuleFor(x => x.Request.BasePrice).GreaterThan(0);
        RuleFor(x => x.Request.DiscountPrice)
            .GreaterThan(0)
            .When(x => x.Request.DiscountPrice.HasValue);
        RuleFor(x => x.Request.DiscountPrice)
            .LessThan(x => x.Request.BasePrice)
            .When(x => x.Request.DiscountPrice.HasValue)
            .WithMessage("Discount price must be less than the base price.");
        RuleFor(x => x.Request.StockQuantity).GreaterThanOrEqualTo(0).When(x => x.Request.TrackInventory);
        RuleFor(x => x.Request.MinOrderQuantity).GreaterThanOrEqualTo(1).When(x => x.Request.TrackInventory);
        RuleFor(x => x.Request.MaxOrderQuantity)
            .GreaterThanOrEqualTo(x => x.Request.MinOrderQuantity)
            .When(x => x.Request.TrackInventory && x.Request.MaxOrderQuantity.HasValue);
        RuleFor(x => x.Request.StockDisplayThreshold)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Request.TrackInventory && x.Request.ShowStockInStore && x.Request.StockDisplayThreshold.HasValue);
    }
}
