namespace ApolloShop.Application.Features.Search.DTOs;

public record SearchSuggestProductDto(
    Guid Id,
    string Name,
    string Slug,
    string? BrandName,
    string? CategoryName,
    decimal Price,
    string? ImageUrl);

public record SearchSuggestBrandDto(
    Guid Id,
    string Name,
    string Slug,
    string? ImageUrl);

public record SearchSuggestCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? ParentName);

public record SearchSuggestDto(
    string Query,
    IReadOnlyList<SearchSuggestProductDto> Products,
    IReadOnlyList<SearchSuggestBrandDto> Brands,
    IReadOnlyList<SearchSuggestCategoryDto> Categories);
