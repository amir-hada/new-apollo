using System.Text.RegularExpressions;

namespace ApolloShop.Application.Features.Authentication;

public static partial class PhoneNormalization
{
    private static readonly Regex IranianMobileRegex = IranianMobilePattern();

    /// <summary>
    /// Normalizes Iranian mobile numbers to 09xxxxxxxxx (digits only).
    /// Accepts forms like 09xxxxxxxxx, +989xxxxxxxxx, 00989xxxxxxxxx, 989xxxxxxxxx.
    /// </summary>
    public static bool TryNormalize(string? input, out string normalized)
    {
        normalized = string.Empty;
        if (string.IsNullOrWhiteSpace(input))
        {
            return false;
        }

        var digits = new string(input.Where(char.IsDigit).ToArray());

        if (digits.StartsWith("0098", StringComparison.Ordinal) && digits.Length >= 14)
        {
            digits = "0" + digits[4..];
        }
        else if (digits.StartsWith("98", StringComparison.Ordinal) && digits.Length == 12)
        {
            digits = "0" + digits[2..];
        }

        if (!IranianMobileRegex.IsMatch(digits))
        {
            return false;
        }

        normalized = digits;
        return true;
    }

    public static string NormalizeOrThrow(string? input)
    {
        if (!TryNormalize(input, out var normalized))
        {
            throw new Domain.Exceptions.ValidationException("PhoneNumber", "شماره موبایل معتبر نیست.");
        }

        return normalized;
    }

    [GeneratedRegex(@"^09\d{9}$")]
    private static partial Regex IranianMobilePattern();
}
