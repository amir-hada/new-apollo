using ApolloShop.Application.Abstractions;

namespace ApolloShop.Infrastructure.Payments;

public class MockPaymentGateway : IPaymentGateway
{
    public Task<PaymentStartResult> StartAsync(
        Guid paymentId,
        Guid orderId,
        decimal amount,
        string callbackUrl,
        CancellationToken cancellationToken = default)
    {
        var authority = $"MOCK-{paymentId:N}";
        var redirect = $"{callbackUrl}?Authority={authority}&Status=OK";
        return Task.FromResult(new PaymentStartResult(true, authority, redirect, "{\"sandbox\":true}", null));
    }

    public Task<PaymentVerifyResult> VerifyAsync(
        string authority,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        // Sandbox always succeeds
        var tracking = $"TRK-{Guid.NewGuid():N}"[..20];
        return Task.FromResult(new PaymentVerifyResult(true, tracking, "{\"sandbox\":true,\"verified\":true}", null));
    }
}
