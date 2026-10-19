using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Application.Features.ShopSettings.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.ShopSettings.Commands;

public record UpdateShopLogisticsSettingsCommand(UpdateShopLogisticsSettingsRequest Request)
    : IRequest<ShopSettingsDto>;

public class UpdateShopLogisticsSettingsCommandHandler
    : IRequestHandler<UpdateShopLogisticsSettingsCommand, ShopSettingsDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ITenantContext _tenant;

    public UpdateShopLogisticsSettingsCommandHandler(IApplicationDbContext db, ITenantContext tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    public async Task<ShopSettingsDto> Handle(
        UpdateShopLogisticsSettingsCommand request,
        CancellationToken cancellationToken)
    {
        var settings = await _db.ShopSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = GetShopSettingsQueryHandler.CreateDefault(_tenant.TenantId);
            _db.ShopSettings.Add(settings);
        }

        var r = request.Request;
        settings.ShippingEnabled = r.ShippingEnabled;
        settings.FlatShippingRate = Math.Max(0, r.FlatShippingRate);
        settings.FreeShippingThreshold = r.FreeShippingThreshold is > 0
            ? r.FreeShippingThreshold
            : null;
        settings.ShippingCustomerNote = string.IsNullOrWhiteSpace(r.ShippingCustomerNote)
            ? null
            : r.ShippingCustomerNote.Trim();

        await _db.SaveChangesAsync(cancellationToken);
        return GetShopSettingsQueryHandler.Map(settings);
    }
}
