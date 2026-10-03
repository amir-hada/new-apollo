using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Authentication.Commands;

public record RefreshTokenCommand(RefreshTokenRequest Request, string? IpAddress) : IRequest<AuthResponse>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTimeProvider _clock;

    public RefreshTokenCommandHandler(IApplicationDbContext db, IJwtTokenService jwt, IDateTimeProvider clock)
    {
        _db = db;
        _jwt = jwt;
        _clock = clock;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var principal = _jwt.GetPrincipalFromExpiredToken(request.Request.AccessToken)
            ?? throw new ApolloShop.Domain.Exceptions.ValidationException("AccessToken", "Invalid access token.");

        var userIdValue = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("AccessToken", "Invalid access token.");
        }

        var stored = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == request.Request.RefreshToken && t.UserId == userId, cancellationToken);

        if (stored is null || stored.RevokedAtUtc is not null || stored.ExpiresAtUtc <= _clock.UtcNow)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("RefreshToken", "Invalid or expired refresh token.");
        }

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        if (!user.IsActive)
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("User", "User account is inactive.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        stored.RevokedAtUtc = _clock.UtcNow;
        var auth = await AuthHelper.IssueTokensAsync(_db, _jwt, _clock, user, roles, permissions, request.IpAddress, cancellationToken);
        stored.ReplacedByToken = auth.RefreshToken;
        await _db.SaveChangesAsync(cancellationToken);
        return auth;
    }
}
