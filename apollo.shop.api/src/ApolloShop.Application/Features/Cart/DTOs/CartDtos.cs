namespace ApolloShop.Application.Features.Cart.DTOs;

public record CartSelectedOptionDto(
    Guid SpecificationId,
    string Name,
    Guid ValueId,
    string Value,
    decimal PriceAdjustment);

public record CartItemDto(
    Guid Id,
    Guid ProductVariantId,
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    string VariantName,
    string Sku,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    int StockQuantity,
    IReadOnlyList<CartSelectedOptionDto> SelectedOptions);

public record CartDto(
    Guid Id,
    IReadOnlyList<CartItemDto> Items,
    decimal Subtotal,
    int ItemCount);

public record AddCartItemRequest(
    Guid ProductVariantId,
    int Quantity,
    IReadOnlyList<Guid>? SelectedSpecValueIds);

public record UpdateCartItemRequest(int Quantity);
