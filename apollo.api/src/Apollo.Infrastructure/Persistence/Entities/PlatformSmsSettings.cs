namespace Apollo.Infrastructure.Persistence.Entities;

/// <summary>Singleton SMS.ir settings shared by the Apollo platform and all shops.</summary>
public sealed class PlatformSmsSettings
{
    public Guid Id { get; set; }

    public bool IsEnabled { get; set; }

    /// <summary>SMS.ir API key (x-api-key).</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Dedicated line number for bulk/text sends (optional).</summary>
    public long? LineNumber { get; set; }

    /// <summary>Verify template id for OTP codes.</summary>
    public int OtpTemplateId { get; set; }

    /// <summary>Parameter name inside the OTP template (e.g. CODE).</summary>
    public string OtpParameterName { get; set; } = "CODE";

    /// <summary>Optional verify template for order notifications; when 0, bulk text is used.</summary>
    public int OrderTemplateId { get; set; }

    /// <summary>Parameter name for order number inside the order verify template.</summary>
    public string OrderParameterName { get; set; } = "ORDER";

    /// <summary>Fallback bulk message when OrderTemplateId is not set. Placeholders: {orderNumber}, {total}.</summary>
    public string OrderMessageTemplate { get; set; } =
        "سفارش {orderNumber} به مبلغ {total} ثبت شد.";

    public DateTime UpdatedAtUtc { get; set; }
}
