using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Payments.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Payments.Commands;

public record StartPaymentCommand(Guid OrderId, string CallbackUrl) : IRequest<StartPaymentResultDto>;
public record VerifyPaymentCommand(string Authority) : IRequest<VerifyPaymentResultDto>;

public class StartPaymentCommandHandler : IRequestHandler<StartPaymentCommand, StartPaymentResultDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IPaymentGateway _gateway;

    public StartPaymentCommandHandler(IApplicationDbContext db, ICurrentUser currentUser, IPaymentGateway gateway)
    {
        _db = db;
        _currentUser = currentUser;
        _gateway = gateway;
    }

    public async Task<StartPaymentResultDto> Handle(StartPaymentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        if (order.Status is OrderStatus.Paid or OrderStatus.Cancelled)
        {
            throw new ConflictException("Order cannot be paid.");
        }

        var payment = await _db.Payments
            .Where(p => p.OrderId == order.Id && p.Status == PaymentStatus.Pending)
            .OrderByDescending(p => p.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Pending payment was not found.");

        var result = await _gateway.StartAsync(payment.Id, order.Id, payment.Amount, request.CallbackUrl, cancellationToken);
        if (!result.Succeeded)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Payment", result.ErrorMessage ?? "Payment start failed.");
        }

        payment.Authority = result.Authority;
        payment.RawResponse = result.RawResponse;
        payment.Gateway = "Mock";
        await _db.SaveChangesAsync(cancellationToken);

        return new StartPaymentResultDto(payment.Id, order.Id, result.Authority, result.RedirectUrl, payment.Status);
    }
}

public class VerifyPaymentCommandHandler : IRequestHandler<VerifyPaymentCommand, VerifyPaymentResultDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IPaymentGateway _gateway;
    private readonly IDateTimeProvider _clock;

    public VerifyPaymentCommandHandler(IApplicationDbContext db, IPaymentGateway gateway, IDateTimeProvider clock)
    {
        _db = db;
        _gateway = gateway;
        _clock = clock;
    }

    public async Task<VerifyPaymentResultDto> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _db.Payments.Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Authority == request.Authority, cancellationToken)
            ?? throw new NotFoundException("Payment", request.Authority);

        if (payment.Status == PaymentStatus.Succeeded)
        {
            return new VerifyPaymentResultDto(payment.Id, payment.OrderId, payment.Status, payment.TrackingCode);
        }

        var result = await _gateway.VerifyAsync(request.Authority, payment.Amount, cancellationToken);
        payment.RawResponse = result.RawResponse;

        if (!result.Succeeded)
        {
            payment.Status = PaymentStatus.Failed;
            await _db.SaveChangesAsync(cancellationToken);
            throw new ApolloShop.Domain.Exceptions.ValidationException("Payment", result.ErrorMessage ?? "Payment verification failed.");
        }

        payment.Status = PaymentStatus.Succeeded;
        payment.TrackingCode = result.TrackingCode;
        payment.PaidAtUtc = _clock.UtcNow;
        payment.Order.Status = OrderStatus.Paid;
        payment.Order.PaidAtUtc = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return new VerifyPaymentResultDto(payment.Id, payment.OrderId, payment.Status, payment.TrackingCode);
    }
}
