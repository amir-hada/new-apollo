using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Orders.Commands;

public record UpdateOrderStatusCommand(Guid Id, OrderStatus Status) : IRequest;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand>
{
    private readonly IApplicationDbContext _db;

    public UpdateOrderStatusCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Order", request.Id);

        order.Status = request.Status;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
