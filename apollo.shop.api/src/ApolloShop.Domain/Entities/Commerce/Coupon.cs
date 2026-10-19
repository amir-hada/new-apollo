using ApolloShop.Domain.Common;

namespace ApolloShop.Domain.Entities.Commerce;

public class Coupon : Entity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal? PercentOff { get; set; }
    public decimal? AmountOff { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
}
