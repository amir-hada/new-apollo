namespace Apollo.Application.Common.Models;

public sealed record AuthResponse(
    Guid UserId,
    string Username,
    string? Email,
    string FirstName,
    string LastName,
    string? MobileNumber,
    string? NationalId,
    string? ProfilePictureUrl,
    IReadOnlyList<string> Roles,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt);

public sealed record UserProfileDto(
    Guid UserId,
    string Username,
    string? Email,
    string FirstName,
    string LastName,
    string? MobileNumber,
    string? NationalId,
    string? ProfilePictureUrl,
    IReadOnlyList<string> Roles);

public sealed record AdminUserListItemDto(
    Guid UserId,
    string Username,
    string? Email,
    string FirstName,
    string LastName,
    string? MobileNumber,
    string? NationalId,
    string? ProfilePictureUrl,
    IReadOnlyList<string> Roles,
    bool IsActive,
    DateTime CreatedAtUtc);
