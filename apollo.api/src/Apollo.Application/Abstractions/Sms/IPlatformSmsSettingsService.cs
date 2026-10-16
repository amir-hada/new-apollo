namespace Apollo.Application.Abstractions.Sms;

public sealed record PlatformSmsSettingsDto(
    bool IsEnabled,
    bool HasApiKey,
    string? ApiKeyMasked,
    long? LineNumber,
    int OtpTemplateId,
    string OtpParameterName,
    int OrderTemplateId,
    string OrderParameterName,
    string OrderMessageTemplate);

public sealed record UpdatePlatformSmsSettingsRequest(
    bool IsEnabled,
    string? ApiKey,
    long? LineNumber,
    int OtpTemplateId,
    string OtpParameterName,
    int OrderTemplateId,
    string OrderParameterName,
    string OrderMessageTemplate);

public interface IPlatformSmsSettingsService
{
    Task<PlatformSmsSettingsDto> GetAsync(CancellationToken cancellationToken = default);

    Task<PlatformSmsSettingsDto> UpdateAsync(
        UpdatePlatformSmsSettingsRequest request,
        CancellationToken cancellationToken = default);
}
