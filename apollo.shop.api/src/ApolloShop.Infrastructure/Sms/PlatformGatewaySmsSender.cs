using System.Net.Http.Json;
using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Exceptions;
using ApolloShop.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ApolloShop.Infrastructure.Sms;

/// <summary>
/// Sends SMS through apollo.api internal endpoints so all shops share one SMS.ir credit.
/// </summary>
public sealed class PlatformGatewaySmsSender : ISmsSender
{
    public const string HeaderName = "X-Provisioning-Key";

    private readonly HttpClient _httpClient;
    private readonly ApolloPlatformOptions _options;
    private readonly ILogger<PlatformGatewaySmsSender> _logger;

    public PlatformGatewaySmsSender(
        HttpClient httpClient,
        IOptions<ApolloPlatformOptions> options,
        ILogger<PlatformGatewaySmsSender> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public Task SendOtpAsync(string phoneNumber, string code, CancellationToken cancellationToken = default) =>
        PostAsync("api/internal/sms/otp", new { mobileNumber = phoneNumber, code }, cancellationToken);

    public Task SendOrderAsync(
        string phoneNumber,
        string orderNumber,
        string totalFormatted,
        CancellationToken cancellationToken = default) =>
        PostAsync(
            "api/internal/sms/order",
            new { mobileNumber = phoneNumber, orderNumber, totalFormatted },
            cancellationToken);

    private async Task PostAsync(string path, object body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.ProvisioningKey))
        {
            throw new ValidationException("Sms", "کلید ارتباط با پلتفرم آپولو برای پیامک تنظیم نشده است.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, path.TrimStart('/'));
        request.Headers.TryAddWithoutValidation(HeaderName, _options.ProvisioningKey);
        request.Content = JsonContent.Create(body);

        try
        {
            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            var detail = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("Platform SMS call failed ({Status}): {Body}", (int)response.StatusCode, detail);
            throw new ValidationException("Sms", "ارسال پیامک از طریق پلتفرم آپولو ناموفق بود.");
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Platform SMS call failed");
            throw new ValidationException("Sms", "ارتباط با سرویس پیامک پلتفرم برقرار نشد.");
        }
    }
}
