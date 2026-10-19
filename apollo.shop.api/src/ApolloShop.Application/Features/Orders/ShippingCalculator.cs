using ShopSettingsEntity = ApolloShop.Domain.Entities.Content.ShopSettings;

namespace ApolloShop.Application.Features.Orders;

internal static class ShippingCalculator
{
    public static decimal Calculate(ShopSettingsEntity? settings, decimal amountTowardFreeShipping)
    {
        if (settings is null || !settings.ShippingEnabled)
        {
            return 0;
        }

        var rate = Math.Max(0, settings.FlatShippingRate);
        if (rate <= 0)
        {
            return 0;
        }

        if (settings.FreeShippingThreshold is decimal threshold && threshold > 0
            && amountTowardFreeShipping >= threshold)
        {
            return 0;
        }

        return rate;
    }
}
