using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Commands;

public record DeleteProductCommand(Guid Id) : IRequest;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;
    private readonly ICurrentUser _currentUser;

    public DeleteProductCommandHandler(IApplicationDbContext db, IDateTimeProvider clock, ICurrentUser currentUser)
    {
        _db = db;
        _clock = clock;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _db.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Product", request.Id);

        var suffix = $"-del-{product.Id:N}"[..20];

        product.IsDeleted = true;
        product.DeletedAtUtc = _clock.UtcNow;
        product.DeletedBy = _currentUser.Email ?? _currentUser.UserId?.ToString();
        product.BrandId = null;
        product.CategoryId = null;

        // Free unique indexes so the same slug/sku/code can be reused.
        product.Slug = Truncate($"{product.Slug}{suffix}", 300);
        product.Sku = string.IsNullOrWhiteSpace(product.Sku)
            ? Truncate($"SKU{suffix}", 100)
            : Truncate($"{product.Sku}{suffix}", 100);
        product.ProductCode = Truncate($"{product.ProductCode}{suffix}", 20);

        foreach (var variant in product.Variants)
        {
            variant.Sku = Truncate($"{variant.Sku}{suffix}", 100);
            variant.IsActive = false;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];
}
