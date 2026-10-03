using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Cart.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Cart.Queries;

public record GetCartQuery(Guid? UserId, string? GuestToken) : IRequest<CartDto>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public GetCartQueryHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await CartResolver.GetOrCreateAsync(_db, _clock, request.UserId, request.GuestToken, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return await CartMapper.MapAsync(_db, cart, cancellationToken);
    }
}
