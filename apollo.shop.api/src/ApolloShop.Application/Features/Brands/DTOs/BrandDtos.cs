namespace ApolloShop.Application.Features.Brands.DTOs;

public record BrandDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImagePath,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record UpsertBrandRequest(
    string Name,
    string Slug,
    string? Description,
    string? ImagePath,
    bool IsActive);
