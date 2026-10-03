namespace ApolloShop.Application.Features.Authentication.DTOs;

public record UserInfoDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string? AvatarUrl,
    IReadOnlyList<string> Roles);

public record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    string RefreshToken,
    UserInfoDto User);

public record LoginRequest(string Email, string Password);
public record SendPhoneOtpRequest(string PhoneNumber);
public record VerifyPhoneOtpRequest(string PhoneNumber, string Code);
public record PhoneLoginRequest(string PhoneNumber, string Password);
public record SendOtpResponse(string PhoneNumber, int ExpiresInSeconds, string? DevCode);
public record RefreshTokenRequest(string AccessToken, string RefreshToken);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);
