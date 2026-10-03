using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopSettingsEntity = ApolloShop.Domain.Entities.Content.ShopSettings;

namespace ApolloShop.Application.Features.ShopSettings.Queries;

public record GetShopSettingsQuery : IRequest<ShopSettingsDto>;

public class GetShopSettingsQueryHandler : IRequestHandler<GetShopSettingsQuery, ShopSettingsDto>
{
    public static readonly Guid DefaultSettingsId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

    private readonly IApplicationDbContext _db;

    public GetShopSettingsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<ShopSettingsDto> Handle(GetShopSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _db.ShopSettings.AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (settings is null)
        {
            settings = CreateDefault();
            _db.ShopSettings.Add(settings);
            await _db.SaveChangesAsync(cancellationToken);
        }

        return Map(settings);
    }

    public static ShopSettingsEntity CreateDefault() => new()
    {
        Id = DefaultSettingsId,
        ShopTitle = "فروشگاه آپولو",
        BrowserTitle = "فروشگاه آپولو | ApolloShop",
        Currency = "تومان",
        Description = "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.",
        MetaDescription = "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.",
        PrimaryColor = "#0f172a",
        CreatedAtUtc = DateTime.UtcNow,
        CreatedBy = "system"
    };

    public static ShopSettingsDto Map(ShopSettingsEntity s) => new(
        s.Id,
        s.ShopTitle,
        s.BrowserTitle,
        s.LogoUrl,
        s.FavIconUrl,
        s.Currency,
        s.SupportPhone,
        s.SupportEmail,
        s.Address,
        s.Description,
        s.MetaDescription,
        s.PrimaryColor);
}
