using System.Text.RegularExpressions;

namespace Apollo.Domain.Helpers;

/// <summary>Subdomain slug rules shared with apollo.shop.api tenants (a-z, 0-9, '-').</summary>
public static partial class SiteSlug
{
    public const int MaxLength = 63;

    private static readonly string[] Reserved = ["www", "api", "admin", "localhost", "swagger", "health", "mail"];

    public static string? Normalize(string? slug) =>
        string.IsNullOrWhiteSpace(slug) ? null : slug.Trim().ToLowerInvariant();

    public static bool IsValid(string slug) =>
        slug.Length <= MaxLength && SlugPattern().IsMatch(slug);

    public static bool IsReserved(string slug) =>
        Reserved.Contains(slug, StringComparer.Ordinal);

    [GeneratedRegex("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")]
    private static partial Regex SlugPattern();
}
