namespace ApolloShop.Application.Features.Addresses.DTOs;

public record AddressDto(
    Guid Id,
    string Title,
    string FullName,
    string Phone,
    string Province,
    string City,
    string PostalCode,
    string Line1,
    string? Line2,
    bool IsDefault);

public record UpsertAddressRequest(
    string Title,
    string FullName,
    string Phone,
    string Province,
    string City,
    string PostalCode,
    string Line1,
    string? Line2,
    bool IsDefault);
