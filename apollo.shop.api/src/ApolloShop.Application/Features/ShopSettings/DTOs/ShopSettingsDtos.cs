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
    IReadOnlyList<HeroBannerDto> HeroBanners,
    IReadOnlyList<HomeStoryDto> HomeStories);

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
    string? PrimaryColor);

public record UpdateHeroBannersRequest(IReadOnlyList<HeroBannerDto> Banners);

public record UpdateHomeStoriesRequest(IReadOnlyList<HomeStoryDto> Stories);

public record UploadFileResultDto(string Url, string FileName, string ContentType, long Size);
