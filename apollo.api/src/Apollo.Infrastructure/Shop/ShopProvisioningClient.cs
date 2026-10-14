using System.Net.Http.Json;
using System.Text.Json;
using Apollo.Application.Abstractions.Shop;
using Apollo.Application.Common.Exceptions;
using Apollo.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace Apollo.Infrastructure.Shop;

public sealed class ShopProvisioningClient : IShopProvisioningClient
{
    public const string HttpClientName = "ShopProvisioning";
    private const string KeyHeader = "X-Provisioning-Key";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly ShopIntegrationOptions _options;

    public ShopProvisioningClient(HttpClient httpClient, IOptions<ShopIntegrationOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<ShopCreateTenantResult> CreateTenantAsync(
        ShopCreateTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await PostAsync<ShopCreateTenantResult>(
            "api/internal/tenants",
            request,
            cancellationToken);

        return result;
    }

    public async Task<ShopSsoCodeResult> CreateSsoCodeAsync(
        string slug,
        string email,
        CancellationToken cancellationToken = default)
    {
        var result = await PostAsync<ShopSsoCodeResult>(
            $"api/internal/tenants/{Uri.EscapeDataString(slug)}/sso-code",
            new { email },
            cancellationToken);

        return result;
    }

    public string BuildStorefrontUrl(string slug)
    {
        var baseUri = new Uri(_options.StorefrontBaseUrl, UriKind.Absolute);
        var builder = new UriBuilder(baseUri) { Host = $"{slug}.{baseUri.Host}" };
        return builder.Uri.GetLeftPart(UriPartial.Authority);
    }

    public string BuildAdminUrl(string slug)
    {
        var path = string.IsNullOrWhiteSpace(_options.AdminPath)
            ? "/admin"
            : "/" + _options.AdminPath.Trim().Trim('/');

        return BuildStorefrontUrl(slug) + path;
    }

    private async Task<T> PostAsync<T>(string path, object body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.ProvisioningKey))
        {
            throw new ShopProvisioningException("کلید ارتباط با سرویس فروشگاه تنظیم نشده است.");
        }

        using var message = new HttpRequestMessage(HttpMethod.Post, path)
        {
            Content = JsonContent.Create(body, options: JsonOptions),
        };
        message.Headers.Add(KeyHeader, _options.ProvisioningKey);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(message, cancellationToken);
        }
        catch (HttpRequestException exception)
        {
            throw new ShopProvisioningException($"ارتباط با سرویس فروشگاه برقرار نشد: {exception.Message}");
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ShopProvisioningException("سرویس فروشگاه در زمان مقرر پاسخ نداد.");
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                throw new ShopProvisioningException(await ReadErrorAsync(response, cancellationToken));
            }

            try
            {
                var result = await response.Content.ReadFromJsonAsync<T>(JsonOptions, cancellationToken);
                return result ?? throw new ShopProvisioningException("پاسخ سرویس فروشگاه نامعتبر است.");
            }
            catch (JsonException)
            {
                throw new ShopProvisioningException("پاسخ سرویس فروشگاه نامعتبر است.");
            }
        }
    }

    private static async Task<string> ReadErrorAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var fallback = $"سرویس فروشگاه خطا برگرداند ({(int)response.StatusCode}).";

        try
        {
            var text = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(text))
            {
                return fallback;
            }

            using var document = JsonDocument.Parse(text);
            var root = document.RootElement;
            if (root.ValueKind == JsonValueKind.Object)
            {
                if (root.TryGetProperty("detail", out var detail) && detail.ValueKind == JsonValueKind.String)
                {
                    return detail.GetString() ?? fallback;
                }

                if (root.TryGetProperty("title", out var title) && title.ValueKind == JsonValueKind.String)
                {
                    return title.GetString() ?? fallback;
                }
            }
        }
        catch (JsonException)
        {
        }

        return fallback;
    }
}
