namespace Apollo.Infrastructure.Sms;

public sealed class SmsIrOptions
{
    public const string SectionName = "SmsIr";

    public string BaseUrl { get; set; } = "https://api.sms.ir/v1";
}
