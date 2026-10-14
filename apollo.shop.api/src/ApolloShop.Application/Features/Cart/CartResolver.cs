using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Entities.Commerce;
using ApolloShop.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Cart;

internal static class CartResolver
{
    public static async Task<ApolloShop.Domain.Entities.Commerce.Cart> GetOrCreateAsync(
        IApplicationDbContext db,
        IDateTimeProvider clock,
        Guid? userId,
        string? guestToken,
        CancellationToken cancellationToken)
    {
        if (userId is null && string.IsNullOrWhiteSpace(guestToken))
        {
            throw new ApolloShop.Domain.Exceptions.ValidationException("Cart", "User or guest token is required.");
        }

        ApolloShop.Domain.Entities.Commerce.Cart? cart = null;
        if (userId is not null)
        {
            cart = await db.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        }
        else
        {
            cart = await db.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.GuestToken == guestToken, cancellationToken);
        }

        if (cart is not null)
        {
            return cart;
        }

        cart = new ApolloShop.Domain.Entities.Commerce.Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GuestToken = userId is null ? guestToken : null,
            UpdatedAtUtc = clock.UtcNow
        };

        db.Carts.Add(cart);
        // Persist immediately so later item inserts don't race against a phantom cart row.
        await db.SaveChangesAsync(cancellationToken);
        return cart;
    }

    public static async Task<ApolloShop.Domain.Entities.Commerce.Cart> GetRequiredAsync(
        IApplicationDbContext db,
        Guid? userId,
        string? guestToken,
        CancellationToken cancellationToken)
    {
        ApolloShop.Domain.Entities.Commerce.Cart? cart = null;
        if (userId is not null)
        {
            cart = await db.Carts.Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(guestToken))
        {
            cart = await db.Carts.Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.GuestToken == guestToken, cancellationToken);
        }

        return cart ?? throw new NotFoundException("Cart was not found.");
    }
}
