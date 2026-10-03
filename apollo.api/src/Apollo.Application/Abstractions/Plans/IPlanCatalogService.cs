using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Plans;

public interface IPlanCatalogService
{
    Task<IReadOnlyList<PublicPlanListItemDto>> GetPublicPlansAsync(
        CancellationToken cancellationToken = default);
}
