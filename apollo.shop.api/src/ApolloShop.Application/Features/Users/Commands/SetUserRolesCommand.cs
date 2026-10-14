using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Users.Commands;

public record SetUserRolesCommand(Guid UserId, IReadOnlyList<string> Roles) : IRequest;

public class SetUserRolesCommandHandler : IRequestHandler<SetUserRolesCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public SetUserRolesCommandHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(SetUserRolesCommand request, CancellationToken cancellationToken)
    {
        EnsureCanAssign(request.Roles, _currentUser);

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        var roleNames = request.Roles.Select(r => r.Trim()).Where(r => r.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        var roles = await _db.Roles.Where(r => roleNames.Contains(r.Name)).ToListAsync(cancellationToken);
        if (roles.Count != roleNames.Count)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Roles", "One or more roles were not found.");
        }

        _db.UserRoles.RemoveRange(user.UserRoles);
        foreach (var role in roles)
        {
            _db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    internal static void EnsureCanAssign(IEnumerable<string> roles, ICurrentUser currentUser)
    {
        if (roles.Any(r => string.Equals(r?.Trim(), WellKnownRoles.PlatformAdmin, StringComparison.OrdinalIgnoreCase))
            && !currentUser.IsInRole(WellKnownRoles.PlatformAdmin))
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Roles", "Only a platform admin can assign the PlatformAdmin role.");
        }
    }
}
