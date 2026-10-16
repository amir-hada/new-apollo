namespace ApolloShop.Application.Abstractions;

public interface ISmsSender
{
    Task SendOtpAsync(string phoneNumber, string code, CancellationToken cancellationToken = default);

    Task SendOrderAsync(
        string phoneNumber,
        string orderNumber,
        string totalFormatted,
        CancellationToken cancellationToken = default);
}
