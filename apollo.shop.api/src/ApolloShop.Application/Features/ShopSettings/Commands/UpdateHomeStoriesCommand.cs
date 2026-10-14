using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Application.Features.ShopSettings.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.ShopSettings.Commands;

public record UpdateHomeStoriesCommand(UpdateHomeStoriesRequest Request) : IRequest<ShopSettingsDto>;

public class UpdateHomeStoriesCommandHandler : IRequestHandler<UpdateHomeStoriesCommand, ShopSettingsDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenant;

    public UpdateHomeStoriesCommandHandler(IApplicationDbContext db, ITenantContext tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    public async Task<ShopSettingsDto> Handle(UpdateHomeStoriesCommand request, CancellationToken cancellationToken)
    {
        var settings = await _db.ShopSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = GetShopSettingsQueryHandler.CreateDefault(_tenant.TenantId);
            _db.ShopSettings.Add(settings);
        }

        settings.HomeStoriesJson = HomeStorySerializer.Serialize(request.Request.Stories);
        await _db.SaveChangesAsync(cancellationToken);
        return GetShopSettingsQueryHandler.Map(settings);
    }
}
