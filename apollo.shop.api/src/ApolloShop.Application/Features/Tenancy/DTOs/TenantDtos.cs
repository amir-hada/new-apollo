namespace ApolloShop.Application.Features.Tenancy.DTOs;

public record CreateTenantRequest(
    string Slug,
    string Name,
    string AdminEmail,
    string AdminPassword,
    string AdminFirstName,
    string AdminLastName,
    string? ShopTitle,
    string? PrimaryColor,
    Guid? ExternalOwnerId = null);

public record InternalSsoCodeRequest(string Email);

public record InternalSsoCodeResultDto(string Code, DateTime ExpiresAtUtc);

public record InternalSsoExchangeRequest(string Code);

public record CreateTenantResultDto(Guid TenantId, string Slug, string Name, string AdminEmail);

public record SetTenantActiveRequest(bool IsActive);

public record TenantDto(
    Guid Id,
    string Slug,
    string Name,
    string? CustomDomain,
    bool IsActive,
    DateTime CreatedAtUtc);
