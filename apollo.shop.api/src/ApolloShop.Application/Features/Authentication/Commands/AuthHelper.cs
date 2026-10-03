using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Domain.Entities.Identity;

namespace ApolloShop.Application.Features.Authentication.Commands;

internal static class AuthHelper
{
    public static Task<AuthResponse> IssueTokensAsync(
        IApplicationDbContext db,
        IJwtTokenService jwt,
        IDateTimeProvider clock,
        User user,
        IReadOnlyList<string> roles,
        IReadOnlyList<string> permissions,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        var (accessToken, expiresAt) = jwt.CreateAccessToken(user, roles, permissions);
        var refreshTokenValue = jwt.CreateRefreshToken();

        db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAtUtc = clock.UtcNow.AddDays(14),
            CreatedAtUtc = clock.UtcNow,
            CreatedByIp = ipAddress
        });

        var response = new AuthResponse(
            accessToken,
            expiresAt,
            refreshTokenValue,
            new UserInfoDto(user.Id, user.Email, user.FirstName, user.LastName, user.PhoneNumber, user.AvatarUrl, roles));

        return Task.FromResult(response);
    }
}
