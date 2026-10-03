using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Entities.Identity;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record LoginCommand(LoginRequest Request, string? IpAddress) : IRequest<AuthResponse>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public LoginCommandHandler(
        IApplicationDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwt,
        IDateTimeProvider clock)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _clock = clock;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var identifier = request.Request.Email.Trim();
        if (string.IsNullOrWhiteSpace(identifier))
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Email", "نام کاربری یا ایمیل الزامی است.");
        }

        var user = await FindUserByIdentifierAsync(identifier, cancellationToken);

        if (user is null || string.IsNullOrEmpty(user.PasswordHash) ||
            !_passwordHasher.Verify(request.Request.Password, user.PasswordHash))
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Email", "نام کاربری یا رمز عبور نادرست است.");
        }

        if (!user.IsActive)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("User", "حساب کاربری غیرفعال است.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        user.LastLoginAtUtc = _clock.UtcNow;
        var auth = await AuthHelper.IssueTokensAsync(_db, _jwt, _clock, user, roles, permissions, request.IpAddress, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return auth;
    }

    private async Task<User?> FindUserByIdentifierAsync(string identifier, CancellationToken cancellationToken)
    {
        if (PhoneNormalization.TryNormalize(identifier, out var phone))
        {
            return await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.PhoneNumber == phone, cancellationToken);
        }

        var lower = identifier.ToLowerInvariant();
        return await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(
                u => u.Email == lower || u.Email.StartsWith(lower + "@"),
                cancellationToken);
    }
}
