namespace Apollo.Application.Abstractions.Sms;

public interface ISmsSender
{
    Task SendOtpAsync(string mobileNumber, string code, CancellationToken cancellationToken = default);

    Task SendTextAsync(string mobileNumber, string message, CancellationToken cancellationToken = default);

    Task SendOrderAsync(
        string mobileNumber,
        string orderNumber,
        string totalFormatted,
        CancellationToken cancellationToken = default);
}
