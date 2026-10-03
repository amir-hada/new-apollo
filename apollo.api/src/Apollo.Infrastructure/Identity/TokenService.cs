using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Models;
using Apollo.Infrastructure.Options;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Apollo.Infrastructure.Identity;

public interface ITokenService
{
    Task<AuthResponse> CreateAuthResponseAsync(
        ApplicationUser user,
        CancellationToken cancellationToken);
}

public sealed class TokenService : ITokenService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtOptions _jwtOptions;
    private readonly IFileAccessService _fileAccessService;

    public TokenService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IOptions<JwtOptions> jwtOptions,
        IFileAccessService fileAccessService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _jwtOptions = jwtOptions.Value;
        _fileAccessService = fileAccessService;
    }

    public async Task<AuthResponse> CreateAuthResponseAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes);
        var profilePictureUrl = await _fileAccessService.ResolveAccessUrlAsync(
            user.ProfilePictureUrl,
            cancellationToken);
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = GenerateAccessToken(user, roles, accessTokenExpiresAt, profilePictureUrl);
        var refreshToken = await CreateRefreshTokenAsync(user, cancellationToken);

        return new AuthResponse(
            user.Id,
            user.UserName!,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.NationalId,
            profilePictureUrl,
            roles.ToList(),
            accessToken,
            refreshToken.Token,
            accessTokenExpiresAt);
    }

    private string GenerateAccessToken(
        ApplicationUser user,
        IList<string> roles,
        DateTime expiresAtUtc,
        string? profilePictureUrl)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName!),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName!),
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
        }

        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            claims.Add(new Claim("mobile_number", user.PhoneNumber));
        }

        if (!string.IsNullOrWhiteSpace(profilePictureUrl))
        {
            claims.Add(new Claim("profile_picture_url", profilePictureUrl));
        }

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
        };

        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return refreshToken;
    }
}
