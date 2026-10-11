using System.Text.Json;
using ApolloShop.Application.Features.ShopSettings.DTOs;

namespace ApolloShop.Application.Features.ShopSettings;

public static class HomeStorySerializer
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public static IReadOnlyList<HomeStoryDto> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];

        try
        {
            var items = JsonSerializer.Deserialize<List<HomeStoryDto>>(json, JsonOptions) ?? [];
            return items
                .Where(s => !string.IsNullOrWhiteSpace(s.ImageUrl))
                .OrderBy(s => s.SortOrder)
                .Select((s, index) => new HomeStoryDto(
                    string.IsNullOrWhiteSpace(s.Id) ? Guid.NewGuid().ToString("N") : s.Id.Trim(),
                    string.IsNullOrWhiteSpace(s.Title) ? "استوری" : s.Title.Trim(),
                    s.ImageUrl.Trim(),
                    string.IsNullOrWhiteSpace(s.LinkUrl) ? null : s.LinkUrl.Trim(),
                    index))
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    public static string? Serialize(IEnumerable<HomeStoryDto>? stories)
    {
        var list = (stories ?? [])
            .Where(s => !string.IsNullOrWhiteSpace(s.ImageUrl))
            .Select((s, index) => new HomeStoryDto(
                string.IsNullOrWhiteSpace(s.Id) ? Guid.NewGuid().ToString("N") : s.Id.Trim(),
                string.IsNullOrWhiteSpace(s.Title) ? "استوری" : s.Title.Trim(),
                s.ImageUrl.Trim(),
                string.IsNullOrWhiteSpace(s.LinkUrl) ? null : s.LinkUrl.Trim(),
                index))
            .ToList();

        return list.Count == 0 ? null : JsonSerializer.Serialize(list, JsonOptions);
    }
}
