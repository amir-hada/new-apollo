using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;

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

    /// <param name="productType">Defaults to <see cref="PlanProductType.Shop"/> when null.</param>
    Task<IReadOnlyList<PlanOptionDto>> GetPlanOptionsAsync(
        PlanProductType? productType = null,
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

    Task<UserPlatformDetailDto> RetryProvisioningAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default);

    Task<ShopSsoRedirectDto> CreateShopSsoRedirectAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AdminSiteListItemDto>> GetAdminSitesAsync(
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default);
}
