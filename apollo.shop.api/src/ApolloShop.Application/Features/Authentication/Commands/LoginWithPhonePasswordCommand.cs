using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record LoginWithPhonePasswordCommand(string PhoneNumber, string Password, string? Ip) : IRequest<AuthResponse>;

public class LoginWithPhonePasswordCommandHandler : IRequestHandler<LoginWithPhonePasswordCommand, AuthResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public LoginWithPhonePasswordCommandHandler(
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

    public async Task<AuthResponse> Handle(LoginWithPhonePasswordCommand request, CancellationToken cancellationToken)
    {
        var phone = PhoneNormalization.NormalizeOrThrow(request.PhoneNumber);

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.PhoneNumber == phone, cancellationToken);

        if (user is null)
        {
            throw new ValidationException("PhoneNumber", "شماره موبایل یا رمز عبور نادرست است.");
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new ValidationException("Password", "رمز عبور برای این حساب تنظیم نشده است. از ورود با کد تأیید استفاده کنید.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new ValidationException("Password", "شماره موبایل یا رمز عبور نادرست است.");
        }

        if (!user.IsActive)
        {
            throw new ValidationException("User", "User account is inactive.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        user.LastLoginAtUtc = _clock.UtcNow;
        var auth = await AuthHelper.IssueTokensAsync(_db, _jwt, _clock, user, roles, permissions, request.Ip, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return auth;
    }
}
