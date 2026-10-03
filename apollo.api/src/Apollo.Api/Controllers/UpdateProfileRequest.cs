namespace Apollo.Api.Controllers;

public sealed record UpdateProfileRequest(
    string? FirstName,
    string? LastName,
    string? Email,
    string? NationalId,
    string? MobileNumber = null);
