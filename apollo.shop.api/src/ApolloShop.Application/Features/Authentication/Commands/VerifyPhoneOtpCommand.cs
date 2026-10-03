using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record VerifyPhoneOtpCommand(string PhoneNumber, string Code, string? Ip) : IRequest<AuthResponse>;

public class VerifyPhoneOtpCommandHandler : IRequestHandler<VerifyPhoneOtpCommand, AuthResponse>
{
    private const int MaxAttempts = 5;

    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public VerifyPhoneOtpCommandHandler(
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

    public async Task<AuthResponse> Handle(VerifyPhoneOtpCommand request, CancellationToken cancellationToken)
    {
        var phone = PhoneNormalization.NormalizeOrThrow(request.PhoneNumber);
        var code = (request.Code ?? string.Empty).Trim();
        var now = _clock.UtcNow;

        var otp = await _db.PhoneOtps
            .Where(o => o.PhoneNumber == phone && o.Purpose == "login" && o.ConsumedAtUtc == null)
            .OrderByDescending(o => o.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (otp is null || otp.ExpiresAtUtc < now)
        {
            throw new ValidationException("Code", "کد تأیید منقضی شده یا یافت نشد.");
        }

        otp.AttemptCount++;

        if (otp.AttemptCount > MaxAttempts)
        {
            otp.ConsumedAtUtc = now;
            await _db.SaveChangesAsync(cancellationToken);
            throw new ValidationException("Code", "تعداد تلاش‌ها بیش از حد مجاز است. دوباره درخواست کد دهید.");
        }

        if (!_passwordHasher.Verify(code, otp.Code))
        {
            await _db.SaveChangesAsync(cancellationToken);
            throw new ValidationException("Code", "کد تأیید نادرست است.");
        }

        otp.ConsumedAtUtc = now;

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.PhoneNumber == phone, cancellationToken);

        if (user is null)
        {
            var customerRole = await _db.Roles.FirstOrDefaultAsync(r => r.NormalizedName == "CUSTOMER", cancellationToken)
                ?? throw new NotFoundException("Customer role was not found.");

            user = new User
            {
                Id = Guid.NewGuid(),
                Email = $"{phone}@users.apolloshop.local",
                PhoneNumber = phone,
                PasswordHash = string.Empty,
                FirstName = "کاربر",
                LastName = string.Empty,
                IsActive = true,
                EmailConfirmed = false,
                PhoneConfirmed = true,
                CreatedAtUtc = now,
                CreatedBy = phone
            };

            _db.Users.Add(user);
            _db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = customerRole.Id });

            // Reload navigation for role/permission mapping after create
            user.UserRoles = [new UserRole { UserId = user.Id, RoleId = customerRole.Id, Role = customerRole }];
        }
        else if (!user.IsActive)
        {
            throw new ValidationException("User", "User account is inactive.");
        }
        else
        {
            user.PhoneConfirmed = true;
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        user.LastLoginAtUtc = now;
        var auth = await AuthHelper.IssueTokensAsync(_db, _jwt, _clock, user, roles, permissions, request.Ip, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return auth;
    }
}
