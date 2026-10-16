using Apollo.Application.Abstractions.Sms;
using Apollo.Infrastructure.Persistence;

namespace Apollo.Infrastructure.Sms;

public sealed class PlatformSmsSettingsService : IPlatformSmsSettingsService
{
    private readonly ApplicationDbContext _dbContext;

    public PlatformSmsSettingsService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PlatformSmsSettingsDto> GetAsync(CancellationToken cancellationToken = default)
    {
        var row = await SmsIrSender.EnsureRowAsync(_dbContext, cancellationToken);
        return Map(row);
    }

    public async Task<PlatformSmsSettingsDto> UpdateAsync(
        UpdatePlatformSmsSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var row = await SmsIrSender.EnsureRowAsync(_dbContext, cancellationToken);

        row.IsEnabled = request.IsEnabled;
        if (!string.IsNullOrWhiteSpace(request.ApiKey))
        {
            row.ApiKey = request.ApiKey.Trim();
        }

        row.LineNumber = request.LineNumber is > 0 ? request.LineNumber : null;
        row.OtpTemplateId = Math.Max(0, request.OtpTemplateId);
        row.OtpParameterName = string.IsNullOrWhiteSpace(request.OtpParameterName)
            ? "CODE"
            : request.OtpParameterName.Trim();
        row.OrderTemplateId = Math.Max(0, request.OrderTemplateId);
        row.OrderParameterName = string.IsNullOrWhiteSpace(request.OrderParameterName)
            ? "ORDER"
            : request.OrderParameterName.Trim();
        row.OrderMessageTemplate = string.IsNullOrWhiteSpace(request.OrderMessageTemplate)
            ? "سفارش {orderNumber} به مبلغ {total} ثبت شد."
            : request.OrderMessageTemplate.Trim();
        row.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(row);
    }

    private static PlatformSmsSettingsDto Map(Persistence.Entities.PlatformSmsSettings row)
    {
        var hasKey = !string.IsNullOrWhiteSpace(row.ApiKey);
        return new PlatformSmsSettingsDto(
            row.IsEnabled,
            hasKey,
            hasKey ? Mask(row.ApiKey) : null,
            row.LineNumber,
            row.OtpTemplateId,
            row.OtpParameterName,
            row.OrderTemplateId,
            row.OrderParameterName,
            row.OrderMessageTemplate);
    }

    private static string Mask(string apiKey)
    {
        if (apiKey.Length <= 8)
        {
            return new string('*', apiKey.Length);
        }

        return $"{apiKey[..4]}…{apiKey[^4..]}";
    }
}
