using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Application.Features.ShopSettings.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.ShopSettings.Commands;

public record UpdateShopSettingsCommand(UpdateShopSettingsRequest Request) : IRequest<ShopSettingsDto>;

public class UpdateShopSettingsCommandHandler : IRequestHandler<UpdateShopSettingsCommand, ShopSettingsDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateShopSettingsCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ShopSettingsDto> Handle(UpdateShopSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await _db.ShopSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = GetShopSettingsQueryHandler.CreateDefault();
            _db.ShopSettings.Add(settings);
        }

        var r = request.Request;
        settings.ShopTitle = r.ShopTitle.Trim();
        settings.BrowserTitle = r.BrowserTitle.Trim();
        settings.LogoUrl = NormalizeUrl(r.LogoUrl);
        settings.FavIconUrl = NormalizeUrl(r.FavIconUrl);
        settings.Currency = NormalizeCurrency(r.Currency);
        settings.SupportPhone = NormalizeOptional(r.SupportPhone);
        settings.SupportEmail = NormalizeOptional(r.SupportEmail);
        settings.Address = NormalizeOptional(r.Address);
        settings.Description = NormalizeOptional(r.Description);
        settings.MetaDescription = NormalizeOptional(r.MetaDescription);
        settings.PrimaryColor = NormalizePrimaryColor(r.PrimaryColor);

        await _db.SaveChangesAsync(cancellationToken);
        return GetShopSettingsQueryHandler.Map(settings);
    }

    private static string NormalizeCurrency(string value)
    {
        var trimmed = value.Trim();
        return trimmed is "ریال" ? "ریال" : "تومان";
    }

    private static string? NormalizeUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizePrimaryColor(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var hex = value.Trim();
        if (!hex.StartsWith('#')) hex = "#" + hex;
        return hex.Length is 4 or 7 ? hex.ToLowerInvariant() : null;
    }
}
