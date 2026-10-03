using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Entities.Catalog;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Products.Commands;

public record RecordProductViewCommand(string SlugOrId, Guid? UserId, string? GuestToken) : IRequest<bool>;

public class RecordProductViewCommandHandler : IRequestHandler<RecordProductViewCommand, bool>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public RecordProductViewCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<bool> Handle(RecordProductViewCommand request, CancellationToken cancellationToken)
    {
        var product = await ResolveProductAsync(request.SlugOrId, cancellationToken)
            ?? throw new NotFoundException("Product", request.SlugOrId);

        var since = _clock.UtcNow.AddHours(-6);
        var guest = string.IsNullOrWhiteSpace(request.GuestToken) ? null : request.GuestToken.Trim();

        var recentlyViewed = await _db.ProductViews.AnyAsync(v =>
                v.ProductId == product.Id
                && v.CreatedAtUtc >= since
                && ((request.UserId != null && v.UserId == request.UserId)
                    || (guest != null && v.GuestToken == guest)),
            cancellationToken);

        if (recentlyViewed) return false;

        _db.ProductViews.Add(new ProductView
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            UserId = request.UserId,
            GuestToken = guest,
            CreatedAtUtc = _clock.UtcNow
        });
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<Product?> ResolveProductAsync(string slugOrId, CancellationToken cancellationToken)
    {
        if (Guid.TryParse(slugOrId, out var id))
        {
            return await _db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        var slug = slugOrId.Trim().ToLowerInvariant();
        return await _db.Products.FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);
    }
}

public record ToggleProductLikeCommand(Guid ProductId, Guid UserId) : IRequest<ProductLikeResultDto>;
public record ProductLikeResultDto(bool Liked, int LikesCount);

public class ToggleProductLikeCommandHandler : IRequestHandler<ToggleProductLikeCommand, ProductLikeResultDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public ToggleProductLikeCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<ProductLikeResultDto> Handle(ToggleProductLikeCommand request, CancellationToken cancellationToken)
    {
        var exists = await _db.Products.AnyAsync(p => p.Id == request.ProductId, cancellationToken);
        if (!exists) throw new NotFoundException("Product", request.ProductId);

        var like = await _db.ProductLikes
            .FirstOrDefaultAsync(l => l.ProductId == request.ProductId && l.UserId == request.UserId, cancellationToken);

        var liked = false;
        if (like is null)
        {
            _db.ProductLikes.Add(new ProductLike
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                UserId = request.UserId,
                CreatedAtUtc = _clock.UtcNow
            });
            liked = true;
        }
        else
        {
            _db.ProductLikes.Remove(like);
        }

        await _db.SaveChangesAsync(cancellationToken);
        var count = await _db.ProductLikes.CountAsync(l => l.ProductId == request.ProductId, cancellationToken);
        return new ProductLikeResultDto(liked, count);
    }
}

public record AddProductCommentCommand(Guid ProductId, Guid UserId, string Body, int? Rating) : IRequest<ProductCommentDto>;
public record ProductCommentDto(Guid Id, string Body, int? Rating, DateTime CreatedAtUtc);

public class AddProductCommentCommandHandler : IRequestHandler<AddProductCommentCommand, ProductCommentDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IDateTimeProvider _clock;

    public AddProductCommentCommandHandler(IApplicationDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<ProductCommentDto> Handle(AddProductCommentCommand request, CancellationToken cancellationToken)
    {
        var exists = await _db.Products.AnyAsync(p => p.Id == request.ProductId, cancellationToken);
        if (!exists) throw new NotFoundException("Product", request.ProductId);

        var body = request.Body.Trim();
        if (body.Length is < 3 or > 2000)
        {
            throw new ValidationException("Body", "Comment must be between 3 and 2000 characters.");
        }

        int? rating = request.Rating;
        if (rating is < 1 or > 5) rating = null;

        var entity = new ProductComment
        {
            Id = Guid.NewGuid(),
            ProductId = request.ProductId,
            UserId = request.UserId,
            Body = body,
            Rating = rating,
            IsApproved = true,
            CreatedAtUtc = _clock.UtcNow
        };
        _db.ProductComments.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new ProductCommentDto(entity.Id, entity.Body, entity.Rating, entity.CreatedAtUtc);
    }
}

public record AddProductCommentRequest(string Body, int? Rating);
