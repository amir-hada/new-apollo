using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Addresses.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Addresses.Queries;

public record GetAddressesQuery : IRequest<IReadOnlyList<AddressDto>>;
public record GetAddressByIdQuery(Guid Id) : IRequest<AddressDto>;

public class GetAddressesQueryHandler : IRequestHandler<GetAddressesQuery, IReadOnlyList<AddressDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetAddressesQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<AddressDto>> Handle(GetAddressesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        return await _db.Addresses.AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAtUtc)
            .Select(a => new AddressDto(a.Id, a.Title, a.FullName, a.Phone, a.Province, a.City, a.PostalCode, a.Line1, a.Line2, a.IsDefault))
            .ToListAsync(cancellationToken);
    }
}

public class GetAddressByIdQueryHandler : IRequestHandler<GetAddressByIdQuery, AddressDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetAddressByIdQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AddressDto> Handle(GetAddressByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var a = await _db.Addresses.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == userId, cancellationToken)
            ?? throw new ApolloShop.Domain.Exceptions.NotFoundException("Address", request.Id);

        return new AddressDto(a.Id, a.Title, a.FullName, a.Phone, a.Province, a.City, a.PostalCode, a.Line1, a.Line2, a.IsDefault);
    }
}
