using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;

namespace Apollo.Application.Abstractions.Plans;

public interface IPlanCatalogService
{
    /// <param name="productType">Defaults to <see cref="PlanProductType.Shop"/> when null.</param>
    Task<IReadOnlyList<PublicPlanListItemDto>> GetPublicPlansAsync(
        PlanProductType? productType = null,
        CancellationToken cancellationToken = default);
}
