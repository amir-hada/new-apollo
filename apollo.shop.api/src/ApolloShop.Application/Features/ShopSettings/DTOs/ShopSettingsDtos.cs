namespace ApolloShop.Application.Features.ShopSettings.DTOs;

public record HeroBannerDto(
    string Id,
    string ImageUrl,
    string? LinkUrl,
    int SortOrder);

public record HomeStoryDto(
    string Id,
    string Title,
    string ImageUrl,
    string? LinkUrl,
    int SortOrder);

public record ShopSettingsDto(
    Guid Id,
    string ShopTitle,
    string BrowserTitle,
    string? LogoUrl,
    string? FavIconUrl,
    string Currency,
    string? SupportPhone,
    string? SupportEmail,
    string? Address,
    string? Description,
    string? MetaDescription,
    string? PrimaryColor,
    string? IndustryKey,
    IReadOnlyList<HeroBannerDto> HeroBanners,
    IReadOnlyList<HomeStoryDto> HomeStories,
    bool SmsOtpEnabled,
    bool SmsOrderEnabled,
    bool ShippingEnabled,
    decimal FlatShippingRate,
    decimal? FreeShippingThreshold,
    string? ShippingCustomerNote);

public record UpdateShopSettingsRequest(
    string ShopTitle,
    string BrowserTitle,
    string? LogoUrl,
    string? FavIconUrl,
    string Currency,
    string? SupportPhone,
    string? SupportEmail,
    string? Address,
    string? Description,
    string? MetaDescription,
    string? PrimaryColor,
    string? IndustryKey = null,
    bool? SmsOtpEnabled = null,
    bool? SmsOrderEnabled = null);

public record UpdateShopSmsSettingsRequest(bool SmsOtpEnabled, bool SmsOrderEnabled);

public record UpdateShopLogisticsSettingsRequest(
    bool ShippingEnabled,
    decimal FlatShippingRate,
    decimal? FreeShippingThreshold,
    string? ShippingCustomerNote);

public record UpdateHeroBannersRequest(IReadOnlyList<HeroBannerDto> Banners);

public record UpdateHomeStoriesRequest(IReadOnlyList<HomeStoryDto> Stories);

public record UploadFileResultDto(string Url, string FileName, string ContentType, long Size);
