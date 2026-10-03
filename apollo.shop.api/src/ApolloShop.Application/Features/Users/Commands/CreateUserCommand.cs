using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Users.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Users.Commands;

public record CreateUserCommand(CreateUserRequest Request) : IRequest<UserDetailDto>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _clock;

    public CreateUserCommandHandler(IApplicationDbContext db, IPasswordHasher passwordHasher, IDateTimeProvider clock)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _clock = clock;
    }

    public async Task<UserDetailDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var email = request.Request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email, cancellationToken))
        {
            throw new ConflictException("Email is already registered.");
        }

        var roleNames = (request.Request.Roles ?? ["Customer"])
            .Select(r => r.Trim())
            .Where(r => r.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var roles = await _db.Roles
            .Where(r => roleNames.Contains(r.Name))
            .ToListAsync(cancellationToken);

        if (roles.Count != roleNames.Count)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Roles", "One or more roles were not found.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Request.Password),
            FirstName = request.Request.FirstName.Trim(),
            LastName = request.Request.LastName.Trim(),
            PhoneNumber = request.Request.PhoneNumber,
            IsActive = request.Request.IsActive,
            CreatedAtUtc = _clock.UtcNow
        };

        _db.Users.Add(user);
        foreach (var role in roles)
        {
            _db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new UserDetailDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber,
            user.IsActive, user.EmailConfirmed, user.CreatedAtUtc, user.LastLoginAtUtc,
            roles.Select(r => r.Name).ToList());
    }
}
