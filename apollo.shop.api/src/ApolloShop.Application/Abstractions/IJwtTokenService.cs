using ApolloShop.Domain.Entities.Identity;
using System.Security.Claims;

namespace ApolloShop.Application.Abstractions;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) CreateAccessToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
    string CreateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
