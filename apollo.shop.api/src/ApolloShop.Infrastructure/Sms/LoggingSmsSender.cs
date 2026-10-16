using ApolloShop.Application.Abstractions;
using Microsoft.Extensions.Logging;

namespace ApolloShop.Infrastructure.Sms;

/// <summary>Dev fallback when ApolloPlatform is not configured.</summary>
public sealed class LoggingSmsSender : ISmsSender
{
    private readonly ILogger<LoggingSmsSender> _logger;

    public LoggingSmsSender(ILogger<LoggingSmsSender> logger) => _logger = logger;

    public Task SendOtpAsync(string phoneNumber, string code, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("DEV SMS OTP to {PhoneNumber}: {Code}", phoneNumber, code);
        return Task.CompletedTask;
    }

    public Task SendOrderAsync(
        string phoneNumber,
        string orderNumber,
        string totalFormatted,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "DEV SMS order to {PhoneNumber}: {OrderNumber} / {Total}",
            phoneNumber,
            orderNumber,
            totalFormatted);
        return Task.CompletedTask;
    }
}
