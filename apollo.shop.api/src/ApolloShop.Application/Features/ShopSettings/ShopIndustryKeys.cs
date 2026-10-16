namespace ApolloShop.Application.Features.ShopSettings;

/// <summary>Known store vertical keys shared with storefront presets and test-data topics.</summary>
public static class ShopIndustryKeys
{
    public const string General = "general";
    public const string Cosmetics = "cosmetics";
    public const string Mobile = "mobile";
    public const string Clothing = "clothing";
    public const string Home = "home";
    public const string Sports = "sports";
    public const string Books = "books";
    public const string Food = "food";
    public const string Kids = "kids";
    public const string Digital = "digital";
    public const string Jewelry = "jewelry";

    public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        General,
        Cosmetics,
        Mobile,
        Clothing,
        Home,
        Sports,
        Books,
        Food,
        Kids,
        Digital,
        Jewelry,
    };

    public static string? Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var key = value.Trim().ToLowerInvariant();
        return All.Contains(key) ? key : null;
    }
}
