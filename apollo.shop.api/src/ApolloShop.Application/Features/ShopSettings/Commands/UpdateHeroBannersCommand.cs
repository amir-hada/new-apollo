using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Application.Features.ShopSettings.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.ShopSettings.Commands;

public record UpdateHeroBannersCommand(UpdateHeroBannersRequest Request) : IRequest<ShopSettingsDto>;

public class UpdateHeroBannersCommandHandler : IRequestHandler<UpdateHeroBannersCommand, ShopSettingsDto>
{
    private readonly IApplicationDbContext _db;

    public UpdateHeroBannersCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ShopSettingsDto> Handle(UpdateHeroBannersCommand request, CancellationToken cancellationToken)
    {
        var settings = await _db.ShopSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = GetShopSettingsQueryHandler.CreateDefault();
            _db.ShopSettings.Add(settings);
        }

        settings.HeroBannersJson = HeroBannerSerializer.Serialize(request.Request.Banners);
        await _db.SaveChangesAsync(cancellationToken);
        return GetShopSettingsQueryHandler.Map(settings);
    }
}
