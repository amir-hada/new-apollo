using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Platforms;

public interface IUserPlatformService
{
    Task<IReadOnlyList<UserPlatformListItemDto>> GetUserPlatformsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<UserPlatformDetailDto> GetUserPlatformAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PlanOptionDto>> GetPlanOptionsAsync(
        CancellationToken cancellationToken = default);

    Task<UserPlatformListItemDto> CreateAsync(
        Guid userId,
        CreateUserPlatformRequest request,
        CancellationToken cancellationToken = default);

    Task<UserPlatformDetailDto> UpdateSettingsAsync(
        Guid userId,
        Guid platformId,
        UpdatePlatformSettingsRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default);
}
