namespace ApolloShop.Application.Features.Categories.DTOs;

public record CategoryTreeDto(Guid Id, string Name, string Slug, string? Description, int SortOrder, bool IsActive, IReadOnlyList<CategoryTreeDto> Children);
public record CategoryDto(Guid Id, string Name, string Slug, string? Description, Guid? ParentId, int SortOrder, bool IsActive);
public record UpsertCategoryRequest(string Name, string Slug, string? Description, Guid? ParentId, int SortOrder, bool IsActive);
