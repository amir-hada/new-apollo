using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Domain.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopSettingsEntity = ApolloShop.Domain.Entities.Content.ShopSettings;

namespace ApolloShop.Application.Features.ShopSettings.Queries;

public record GetShopSettingsQuery : IRequest<ShopSettingsDto>;

public class GetShopSettingsQueryHandler : IRequestHandler<GetShopSettingsQuery, ShopSettingsDto>
{
    public static readonly Guid DefaultSettingsId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenant;

    public GetShopSettingsQueryHandler(IApplicationDbContext db, ITenantContext tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    public async Task<ShopSettingsDto> Handle(GetShopSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _db.ShopSettings.AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (settings is null)
        {
            settings = CreateDefault(_tenant.TenantId);
            _db.ShopSettings.Add(settings);
            await _db.SaveChangesAsync(cancellationToken);
        }

        return Map(settings);
    }

    public static ShopSettingsEntity CreateDefault(Guid tenantId) => new()
    {
        Id = tenantId == TenantIds.Default ? DefaultSettingsId : Guid.NewGuid(),
        TenantId = tenantId,
        ShopTitle = "فروشگاه آپولو",
        BrowserTitle = "فروشگاه آپولو | ApolloShop",
        Currency = "تومان",
        Description = "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.",
        MetaDescription = "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.",
        PrimaryColor = "#0f172a",
        SmsOtpEnabled = true,
        SmsOrderEnabled = true,
        ShippingEnabled = true,
        FlatShippingRate = 50_000m,
        FreeShippingThreshold = 500_000m,
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
        s.PrimaryColor,
        s.IndustryKey,
        HeroBannerSerializer.Deserialize(s.HeroBannersJson),
        HomeStorySerializer.Deserialize(s.HomeStoriesJson),
        s.SmsOtpEnabled,
        s.SmsOrderEnabled,
        s.ShippingEnabled,
        s.FlatShippingRate,
        s.FreeShippingThreshold,
        s.ShippingCustomerNote);
}
