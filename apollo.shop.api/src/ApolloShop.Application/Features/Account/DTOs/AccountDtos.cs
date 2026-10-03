namespace ApolloShop.Application.Features.Account.DTOs;

public record ProfileDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? AvatarUrl,
    IReadOnlyList<string> Roles);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? AvatarUrl);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
