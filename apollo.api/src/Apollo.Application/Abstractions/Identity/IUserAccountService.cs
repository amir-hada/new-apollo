using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Identity;

public interface IUserAccountService
{
    Task<AuthResponse> RegisterWithEmailAsync(
        string email,
        string username,
        string password,
        CancellationToken cancellationToken);

    Task<AuthResponse> LoginWithEmailAsync(
        string email,
        string password,
        CancellationToken cancellationToken);

    Task<AuthResponse> LoginWithUsernameAsync(
        string username,
        string password,
        CancellationToken cancellationToken);

    Task<SendOtpResponse> SendOtpAsync(
        string mobileNumber,
        CancellationToken cancellationToken);

    Task<AuthResponse> VerifyPhoneAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken);

    Task<AuthResponse> LoginWithPhoneAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken);

    Task<AuthResponse> RegisterWithPhoneAsync(
        string mobileNumber,
        string code,
        CancellationToken cancellationToken);

    Task<ForgotPasswordResponse> ForgotPasswordAsync(
        string email,
        CancellationToken cancellationToken);

    Task<UserProfileDto> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<UserProfileDto> UpdateProfileAsync(
        Guid userId,
        string? firstName,
        string? lastName,
        string? email,
        string? nationalId,
        string? mobileNumber,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<AdminUserListItemDto>> GetUsersAsync(
        CancellationToken cancellationToken);
}
