using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Plans;

public interface IAdminPlanService
{
    Task<IReadOnlyList<AdminPlanListItemDto>> GetPlansAsync(
        CancellationToken cancellationToken = default);

    Task<AdminPlanListItemDto> GetPlanByIdAsync(
        Guid planId,
        CancellationToken cancellationToken = default);

    Task<AdminPlanListItemDto> CreatePlanAsync(
        CreatePlanRequest request,
        CancellationToken cancellationToken = default);

    Task<AdminPlanListItemDto> UpdatePlanAsync(
        Guid planId,
        UpdatePlanRequest request,
        CancellationToken cancellationToken = default);

    Task DeletePlanAsync(
        Guid planId,
        CancellationToken cancellationToken = default);
}
