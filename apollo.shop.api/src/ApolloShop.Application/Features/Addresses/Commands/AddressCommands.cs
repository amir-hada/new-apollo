using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Addresses.DTOs;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Addresses.Commands;

public record CreateAddressCommand(UpsertAddressRequest Request) : IRequest<AddressDto>;
public record UpdateAddressCommand(Guid Id, UpsertAddressRequest Request) : IRequest<AddressDto>;
public record DeleteAddressCommand(Guid Id) : IRequest;
public record SetDefaultAddressCommand(Guid Id) : IRequest;

public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, AddressDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;

    public CreateAddressCommandHandler(IApplicationDbContext db, ICurrentUser currentUser, IDateTimeProvider clock)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<AddressDto> Handle(CreateAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        if (request.Request.IsDefault)
        {
            await ClearDefaultsAsync(userId, cancellationToken);
        }

        var entity = MapNew(userId, request.Request, _clock.UtcNow);
        _db.Addresses.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return ToDto(entity);
    }

    private async Task ClearDefaultsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var defaults = await _db.Addresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync(cancellationToken);
        foreach (var item in defaults)
        {
            item.IsDefault = false;
        }
    }

    internal static Address MapNew(Guid userId, UpsertAddressRequest r, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Title = r.Title.Trim(),
        FullName = r.FullName.Trim(),
        Phone = r.Phone.Trim(),
        Province = r.Province.Trim(),
        City = r.City.Trim(),
        PostalCode = r.PostalCode.Trim(),
        Line1 = r.Line1.Trim(),
        Line2 = r.Line2,
        IsDefault = r.IsDefault,
        CreatedAtUtc = now
    };

    internal static AddressDto ToDto(Address a) =>
        new(a.Id, a.Title, a.FullName, a.Phone, a.Province, a.City, a.PostalCode, a.Line1, a.Line2, a.IsDefault);
}

public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand, AddressDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public UpdateAddressCommandHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<AddressDto> Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address", request.Id);

        if (request.Request.IsDefault)
        {
            var defaults = await _db.Addresses.Where(a => a.UserId == userId && a.IsDefault && a.Id != entity.Id).ToListAsync(cancellationToken);
            foreach (var item in defaults)
            {
                item.IsDefault = false;
            }
        }

        entity.Title = request.Request.Title.Trim();
        entity.FullName = request.Request.FullName.Trim();
        entity.Phone = request.Request.Phone.Trim();
        entity.Province = request.Request.Province.Trim();
        entity.City = request.Request.City.Trim();
        entity.PostalCode = request.Request.PostalCode.Trim();
        entity.Line1 = request.Request.Line1.Trim();
        entity.Line2 = request.Request.Line2;
        entity.IsDefault = request.Request.IsDefault;
        await _db.SaveChangesAsync(cancellationToken);
        return CreateAddressCommandHandler.ToDto(entity);
    }
}

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public DeleteAddressCommandHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address", request.Id);

        _db.Addresses.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public SetDefaultAddressCommandHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address", request.Id);

        var addresses = await _db.Addresses.Where(a => a.UserId == userId).ToListAsync(cancellationToken);
        foreach (var address in addresses)
        {
            address.IsDefault = address.Id == entity.Id;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
