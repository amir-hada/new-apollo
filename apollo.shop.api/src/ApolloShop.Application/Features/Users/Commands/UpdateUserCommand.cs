using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Users.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Users.Commands;

public record UpdateUserCommand(Guid Id, UpdateUserRequest Request) : IRequest<UserDetailDto>;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDetailDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateUserCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<UserDetailDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);

        user.FirstName = request.Request.FirstName.Trim();
        user.LastName = request.Request.LastName.Trim();
        user.PhoneNumber = request.Request.PhoneNumber;
        user.IsActive = request.Request.IsActive;

        await _db.SaveChangesAsync(cancellationToken);

        return new UserDetailDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber,
            user.IsActive, user.EmailConfirmed, user.CreatedAtUtc, user.LastLoginAtUtc,
            user.UserRoles.Select(ur => ur.Role.Name).ToList());
    }
}
