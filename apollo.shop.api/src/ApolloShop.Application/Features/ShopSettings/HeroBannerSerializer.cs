using System.Text.Json;
using ApolloShop.Application.Features.ShopSettings.DTOs;

namespace ApolloShop.Application.Features.ShopSettings;

public static class HeroBannerSerializer
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public static IReadOnlyList<HeroBannerDto> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];

        try
        {
            var items = JsonSerializer.Deserialize<List<HeroBannerDto>>(json, JsonOptions) ?? [];
            return items
                .Where(b => !string.IsNullOrWhiteSpace(b.ImageUrl))
                .OrderBy(b => b.SortOrder)
                .Select((b, index) => new HeroBannerDto(
                    string.IsNullOrWhiteSpace(b.Id) ? Guid.NewGuid().ToString("N") : b.Id.Trim(),
                    b.ImageUrl.Trim(),
                    string.IsNullOrWhiteSpace(b.LinkUrl) ? null : b.LinkUrl.Trim(),
                    index))
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static string? Serialize(IEnumerable<HeroBannerDto>? banners)
    {
        var list = (banners ?? [])
            .Where(b => !string.IsNullOrWhiteSpace(b.ImageUrl))
            .Select((b, index) => new HeroBannerDto(
                string.IsNullOrWhiteSpace(b.Id) ? Guid.NewGuid().ToString("N") : b.Id.Trim(),
                b.ImageUrl.Trim(),
                string.IsNullOrWhiteSpace(b.LinkUrl) ? null : b.LinkUrl.Trim(),
                index))
            .ToList();

        return list.Count == 0 ? null : JsonSerializer.Serialize(list, JsonOptions);
    }
}
