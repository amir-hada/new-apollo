using ApolloShop.Domain.Enums;

namespace ApolloShop.Application.Features.Payments.DTOs;

public record StartPaymentResultDto(Guid PaymentId, Guid OrderId, string? Authority, string? RedirectUrl, PaymentStatus Status);
public record VerifyPaymentResultDto(Guid PaymentId, Guid OrderId, PaymentStatus Status, string? TrackingCode);
