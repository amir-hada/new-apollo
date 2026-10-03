namespace ApolloShop.Application.Abstractions;

public record PaymentStartResult(bool Succeeded, string? Authority, string? RedirectUrl, string? RawResponse, string? ErrorMessage);
public record PaymentVerifyResult(bool Succeeded, string? TrackingCode, string? RawResponse, string? ErrorMessage);

public interface IPaymentGateway
{
    Task<PaymentStartResult> StartAsync(Guid paymentId, Guid orderId, decimal amount, string callbackUrl, CancellationToken cancellationToken = default);
    Task<PaymentVerifyResult> VerifyAsync(string authority, decimal amount, CancellationToken cancellationToken = default);
}
