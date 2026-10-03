namespace Apollo.Domain.Helpers;

public static class IranianNationalIdValidator
{
    public static bool IsValid(string nationalId)
    {
        if (string.IsNullOrWhiteSpace(nationalId) || nationalId.Length != 10)
        {
            return false;
        }

        if (!nationalId.All(char.IsDigit))
        {
            return false;
        }

        if (nationalId.Distinct().Count() == 1)
        {
            return false;
        }

        var check = int.Parse(nationalId[9].ToString());
        var sum = Enumerable.Range(0, 9)
            .Sum(index => int.Parse(nationalId[index].ToString()) * (10 - index));

        var remainder = sum % 11;
        return remainder < 2 ? check == remainder : check + remainder == 11;
    }
}
