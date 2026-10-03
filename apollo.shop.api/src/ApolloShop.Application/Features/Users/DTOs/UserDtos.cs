namespace ApolloShop.Application.Features.Users.DTOs;

public record UserListItemDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? LastLoginAtUtc,
    IReadOnlyList<string> Roles);

public record UserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    bool IsActive,
    bool EmailConfirmed,
    DateTime CreatedAtUtc,
    DateTime? LastLoginAtUtc,
    IReadOnlyList<string> Roles);

public record CreateUserRequest(string Email, string Password, string FirstName, string LastName, string? PhoneNumber, bool IsActive, IReadOnlyList<string>? Roles);
public record UpdateUserRequest(string FirstName, string LastName, string? PhoneNumber, bool IsActive);
public record SetUserRolesRequest(IReadOnlyList<string> Roles);
