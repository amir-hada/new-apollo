namespace Apollo.Application.Common.Models;

public sealed record SendOtpResponse(string Message, string? DebugCode);

public sealed record ForgotPasswordResponse(string Message);
