using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Users.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Users.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDetailDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetUserByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<UserDetailDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);

        return new UserDetailDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber,
            user.IsActive, user.EmailConfirmed, user.CreatedAtUtc, user.LastLoginAtUtc,
            user.UserRoles.Select(ur => ur.Role.Name).ToList());
    }
}
