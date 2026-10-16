using System.Text.RegularExpressions;

namespace Apollo.Infrastructure.Sms;

public static partial class SmsPhoneNormalizer
{
    /// <summary>SMS.ir expects mobiles like 9120000000 (without leading zero).</summary>
    public static string ToSmsIrMobile(string phone)
    {
        var digits = DigitPattern().Replace(phone ?? string.Empty, string.Empty);
        if (digits.StartsWith("98") && digits.Length >= 12)
        {
            digits = digits[2..];
        }

        if (digits.StartsWith('0') && digits.Length == 11)
        {
            digits = digits[1..];
        }

        return digits;
    }

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitPattern();
}
