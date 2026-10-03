using System.Text.Json;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Exceptions;

namespace ApolloShop.Application.Features.Products;

public record SelectedSpecOptionSnapshot(
    Guid SpecificationId,
    string Name,
    Guid ValueId,
    string Value,
    decimal PriceAdjustment);

internal static class ProductSpecPricing
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static decimal SellingPrice(Product product) =>
        product.DiscountPrice ?? product.BasePrice;

    public static IReadOnlyList<SelectedSpecOptionSnapshot> ResolveSelections(
        Product product,
        IReadOnlyList<Guid>? selectedValueIds)
    {
        var orderParams = product.Specs
            .Where(s => s.IsOrderParameter)
            .OrderBy(s => s.SortOrder)
            .ToList();

        if (orderParams.Count == 0)
        {
            return [];
        }

        var ids = (selectedValueIds ?? []).Distinct().ToList();
        var snapshots = new List<SelectedSpecOptionSnapshot>();

        foreach (var spec in orderParams)
        {
            var values = spec.Values.OrderBy(v => v.SortOrder).ToList();
            if (values.Count < 2)
            {
                throw new ValidationException(
                    "Specs",
                    $"Order parameter «{spec.Name}» must have at least two values.");
            }

            var match = values.FirstOrDefault(v => ids.Contains(v.Id));
            if (match is null)
            {
                throw new ValidationException(
                    "Specs",
                    $"Please select a value for «{spec.Name}».");
            }

            snapshots.Add(new SelectedSpecOptionSnapshot(
                spec.Id,
                spec.Name,
                match.Id,
                match.Value,
                match.PriceAdjustment));
        }

        // Reject unknown ids that don't belong to order parameters.
        var allowed = snapshots.Select(s => s.ValueId).ToHashSet();
        if (ids.Any(id => !allowed.Contains(id)))
        {
            throw new ValidationException("Specs", "Invalid specification selection.");
        }

        return snapshots;
    }

    public static decimal UnitPriceWithOptions(Product product, IReadOnlyList<SelectedSpecOptionSnapshot> options) =>
        SellingPrice(product) + options.Sum(o => o.PriceAdjustment);

    public static string Serialize(IReadOnlyList<SelectedSpecOptionSnapshot> options) =>
        JsonSerializer.Serialize(options, JsonOptions);

    public static IReadOnlyList<SelectedSpecOptionSnapshot> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        return JsonSerializer.Deserialize<List<SelectedSpecOptionSnapshot>>(json, JsonOptions) ?? [];
    }
}
