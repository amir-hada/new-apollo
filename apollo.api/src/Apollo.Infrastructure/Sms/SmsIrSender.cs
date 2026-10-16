using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Apollo.Application.Abstractions.Sms;
using Apollo.Application.Common.Exceptions;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Apollo.Infrastructure.Sms;

public sealed class SmsIrSender : ISmsSender
{
    private static readonly Guid SettingsId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");

    private readonly HttpClient _httpClient;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<SmsIrSender> _logger;
    private readonly SmsIrOptions _options;

    public SmsIrSender(
        HttpClient httpClient,
        ApplicationDbContext dbContext,
        IOptions<SmsIrOptions> options,
        ILogger<SmsIrSender> logger)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendOtpAsync(string mobileNumber, string code, CancellationToken cancellationToken = default)
    {
        var settings = await GetRequiredSettingsAsync(cancellationToken);
        if (settings.OtpTemplateId <= 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["sms"] = ["شناسه قالب OTP در تنظیمات پنل پیامکی وارد نشده است."],
            });
        }

        var mobile = SmsPhoneNormalizer.ToSmsIrMobile(mobileNumber);
        var parameterName = string.IsNullOrWhiteSpace(settings.OtpParameterName)
            ? "CODE"
            : settings.OtpParameterName.Trim();

        await PostVerifyAsync(
            settings.ApiKey,
            mobile,
            settings.OtpTemplateId,
            [new VerifyParameter(parameterName, code)],
            cancellationToken);
    }

    public async Task SendTextAsync(string mobileNumber, string message, CancellationToken cancellationToken = default)
    {
        var settings = await GetRequiredSettingsAsync(cancellationToken);
        if (settings.LineNumber is null or <= 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["sms"] = ["شماره خط پیامک برای ارسال متنی تنظیم نشده است."],
            });
        }

        var mobile = SmsPhoneNormalizer.ToSmsIrMobile(mobileNumber);
        await PostBulkAsync(settings.ApiKey, settings.LineNumber.Value, mobile, message, cancellationToken);
    }

    public async Task SendOrderAsync(
        string mobileNumber,
        string orderNumber,
        string totalFormatted,
        CancellationToken cancellationToken = default)
    {
        var settings = await GetRequiredSettingsAsync(cancellationToken);
        var mobile = SmsPhoneNormalizer.ToSmsIrMobile(mobileNumber);

        if (settings.OrderTemplateId > 0)
        {
            var parameterName = string.IsNullOrWhiteSpace(settings.OrderParameterName)
                ? "ORDER"
                : settings.OrderParameterName.Trim();

            await PostVerifyAsync(
                settings.ApiKey,
                mobile,
                settings.OrderTemplateId,
                [new VerifyParameter(parameterName, orderNumber)],
                cancellationToken);
            return;
        }

        if (settings.LineNumber is null or <= 0)
        {
            _logger.LogWarning("Order SMS skipped: neither order template nor line number is configured.");
            return;
        }

        var template = string.IsNullOrWhiteSpace(settings.OrderMessageTemplate)
            ? "سفارش {orderNumber} به مبلغ {total} ثبت شد."
            : settings.OrderMessageTemplate;

        var message = template
            .Replace("{orderNumber}", orderNumber, StringComparison.OrdinalIgnoreCase)
            .Replace("{total}", totalFormatted, StringComparison.OrdinalIgnoreCase);

        await PostBulkAsync(settings.ApiKey, settings.LineNumber.Value, mobile, message, cancellationToken);
    }

    internal static async Task<PlatformSmsSettings> EnsureRowAsync(
        ApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var row = await dbContext.PlatformSmsSettings.FirstOrDefaultAsync(cancellationToken);
        if (row is not null)
        {
            return row;
        }

        row = new PlatformSmsSettings
        {
            Id = SettingsId,
            IsEnabled = false,
            ApiKey = string.Empty,
            OtpParameterName = "CODE",
            OrderParameterName = "ORDER",
            OrderMessageTemplate = "سفارش {orderNumber} به مبلغ {total} ثبت شد.",
            UpdatedAtUtc = DateTime.UtcNow,
        };
        dbContext.PlatformSmsSettings.Add(row);
        await dbContext.SaveChangesAsync(cancellationToken);
        return row;
    }

    private async Task<PlatformSmsSettings> GetRequiredSettingsAsync(CancellationToken cancellationToken)
    {
        var settings = await EnsureRowAsync(_dbContext, cancellationToken);
        if (!settings.IsEnabled || string.IsNullOrWhiteSpace(settings.ApiKey))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["sms"] = ["پنل پیامکی فعال نیست یا کلید API تنظیم نشده است."],
            });
        }

        return settings;
    }

    private async Task PostVerifyAsync(
        string apiKey,
        string mobile,
        int templateId,
        IReadOnlyList<VerifyParameter> parameters,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, Combine("send/verify"));
        request.Headers.TryAddWithoutValidation("x-api-key", apiKey);
        request.Headers.TryAddWithoutValidation("Accept", "application/json");
        request.Content = JsonContent.Create(new
        {
            mobile,
            templateId,
            parameters,
        });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    private async Task PostBulkAsync(
        string apiKey,
        long lineNumber,
        string mobile,
        string message,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, Combine("send/bulk"));
        request.Headers.TryAddWithoutValidation("x-api-key", apiKey);
        request.Headers.TryAddWithoutValidation("Accept", "application/json");
        request.Content = JsonContent.Create(new
        {
            lineNumber,
            messageText = message,
            mobiles = new[] { mobile },
            sendDateTime = (string?)null,
        });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    private string Combine(string relative)
    {
        var baseUrl = (_options.BaseUrl ?? "https://api.sms.ir/v1").TrimEnd('/');
        return $"{baseUrl}/{relative.TrimStart('/')}";
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (response.IsSuccessStatusCode)
        {
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
                if (doc.RootElement.TryGetProperty("status", out var status) &&
                    status.ValueKind == JsonValueKind.Number &&
                    status.GetInt32() != 1)
                {
                    var message = doc.RootElement.TryGetProperty("message", out var msg)
                        ? msg.GetString()
                        : body;
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["sms"] = [message ?? "ارسال پیامک ناموفق بود."],
                    });
                }
            }
            catch (JsonException)
            {
                // Non-JSON success body is acceptable.
            }

            return;
        }

        _logger.LogWarning("SMS.ir error {Status}: {Body}", (int)response.StatusCode, body);
        throw new ValidationException(new Dictionary<string, string[]>
        {
            ["sms"] = ["ارسال پیامک ناموفق بود. تنظیمات پنل پیامکی را بررسی کنید."],
        });
    }

    private sealed record VerifyParameter(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("value")] string Value);
}
