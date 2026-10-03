namespace ApolloShop.Application.Features.ShopSettings.DTOs;

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
    string? PrimaryColor);

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

public record UploadFileResultDto(string Url, string FileName, string ContentType, long Size);
