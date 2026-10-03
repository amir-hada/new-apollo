using ApolloShop.Application.Features.ShopSettings.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.ShopSettings.Validators;

public class UpdateShopSettingsCommandValidator : AbstractValidator<UpdateShopSettingsCommand>
{
    public UpdateShopSettingsCommandValidator()
    {
        RuleFor(x => x.Request.ShopTitle).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.BrowserTitle).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.Currency)
            .NotEmpty()
            .MaximumLength(50)
            .Must(c => c is "تومان" or "ریال")
            .WithMessage("Currency must be تومان or ریال.");
        RuleFor(x => x.Request.LogoUrl).MaximumLength(1000).When(x => x.Request.LogoUrl is not null);
        RuleFor(x => x.Request.FavIconUrl).MaximumLength(1000).When(x => x.Request.FavIconUrl is not null);
        RuleFor(x => x.Request.SupportPhone).MaximumLength(50).When(x => x.Request.SupportPhone is not null);
        RuleFor(x => x.Request.SupportEmail).MaximumLength(256).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Request.SupportEmail));
        RuleFor(x => x.Request.Address).MaximumLength(500).When(x => x.Request.Address is not null);
        RuleFor(x => x.Request.Description).MaximumLength(2000).When(x => x.Request.Description is not null);
        RuleFor(x => x.Request.MetaDescription).MaximumLength(500).When(x => x.Request.MetaDescription is not null);
        RuleFor(x => x.Request.PrimaryColor)
            .MaximumLength(20)
            .Matches("^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.PrimaryColor));
    }
}
