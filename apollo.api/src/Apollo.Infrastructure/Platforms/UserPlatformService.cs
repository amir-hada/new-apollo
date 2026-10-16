using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Abstractions.Shop;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Apollo.Domain.Helpers;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using ValidationException = Apollo.Application.Common.Exceptions.ValidationException;

namespace Apollo.Infrastructure.Platforms;

public sealed class UserPlatformService : IUserPlatformService
{
    private const int MaxProvisioningErrorLength = 1000;

    private readonly ApplicationDbContext _dbContext;
    private readonly IFileAccessService _fileAccessService;
    private readonly IShopProvisioningClient _shopClient;
    private readonly ILogger<UserPlatformService> _logger;

    public UserPlatformService(
        ApplicationDbContext dbContext,
        IFileAccessService fileAccessService,
        IShopProvisioningClient shopClient,
        ILogger<UserPlatformService> logger)
    {
        _dbContext = dbContext;
        _fileAccessService = fileAccessService;
        _shopClient = shopClient;
        _logger = logger;
    }

    public async Task<IReadOnlyList<UserPlatformListItemDto>> GetUserPlatformsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var platforms = await _dbContext.UserPlatforms
            .AsNoTracking()
            .Include(platform => platform.Plan)
            .Where(platform => platform.UserId == userId)
            .OrderByDescending(platform => platform.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return platforms.Select(MapListItem).ToList();
    }

    public async Task<UserPlatformDetailDto> GetUserPlatformAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default)
    {
        var platform = await _dbContext.UserPlatforms
            .AsNoTracking()
            .Include(item => item.Configuration)
            .Include(item => item.Plan)
                .ThenInclude(plan => plan.Templates)
            .FirstOrDefaultAsync(
                item => item.Id == platformId && item.UserId == userId,
                cancellationToken)
            ?? throw new NotFoundException("پلتفرم یافت نشد.");

        return await MapDetailAsync(platform, cancellationToken);
    }

    public async Task<IReadOnlyList<PlanOptionDto>> GetPlanOptionsAsync(
        PlanProductType? productType = null,
        CancellationToken cancellationToken = default)
    {
        var type = productType ?? PlanProductType.Shop;

        var plans = await _dbContext.Plans
            .AsNoTracking()
            .Where(plan => plan.IsAvailable && plan.IsPublished && plan.ProductType == type)
            .OrderBy(plan => plan.PriceInToman)
            .ThenBy(plan => plan.Name)
            .ToListAsync(cancellationToken);

        var result = new List<PlanOptionDto>(plans.Count);

        foreach (var plan in plans)
        {
            var imageUrl = await _fileAccessService.ResolveAccessUrlAsync(
                plan.ImageFileId,
                cancellationToken);

            result.Add(new PlanOptionDto(
                plan.Id,
                plan.Name,
                imageUrl,
                plan.PriceInToman,
                plan.DiscountedPriceInToman,
                plan.BillingPeriod,
                plan.IsAvailable,
                plan.ProductType));
        }

        return result;
    }

    public async Task<UserPlatformListItemDto> CreateAsync(
        Guid userId,
        CreateUserPlatformRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await ValidatePlanAsync(request.PlanId, cancellationToken);

        var slug = plan.ProductType == PlanProductType.Shop
            ? SiteSlug.Normalize(request.Slug)
            : null;

        if (slug is not null)
        {
            await ValidateSlugAsync(slug, excludePlatformId: null, cancellationToken);
        }

        var now = DateTime.UtcNow;
        var platform = new UserPlatform
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlanId = request.PlanId,
            Name = request.Name.Trim(),
            TenantSlug = slug,
            ProvisioningStatus = SiteProvisioningStatus.Pending,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        _dbContext.UserPlatforms.Add(platform);
        await SaveReservingSlugAsync(cancellationToken);

        await _dbContext.Entry(platform)
            .Reference(item => item.Plan)
            .LoadAsync(cancellationToken);

        if (slug is not null)
        {
            await ProvisionShopAsync(platform, cancellationToken);
        }

        return MapListItem(platform);
    }

    public async Task<UserPlatformDetailDto> UpdateSettingsAsync(
        Guid userId,
        Guid platformId,
        UpdatePlatformSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var platform = await _dbContext.UserPlatforms
            .Include(item => item.Configuration)
            .Include(item => item.Plan)
                .ThenInclude(plan => plan.Templates)
            .FirstOrDefaultAsync(
                item => item.Id == platformId && item.UserId == userId,
                cancellationToken)
            ?? throw new NotFoundException("پلتفرم یافت نشد.");

        await ValidateLogoFileAsync(request.WebsiteLogoFileId, cancellationToken);
        ValidateTemplateCode(platform.Plan, request.TemplateCode);

        var isShop = platform.Plan.ProductType == PlanProductType.Shop;
        var requestedSlug = isShop ? SiteSlug.Normalize(request.Slug) : null;

        if (requestedSlug is not null && requestedSlug != platform.TenantSlug)
        {
            if (platform.TenantId is not null)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["slug"] = ["آدرس سایت پس از ساخت قابل تغییر نیست."],
                });
            }

            await ValidateSlugAsync(requestedSlug, platform.Id, cancellationToken);
            platform.TenantSlug = requestedSlug;
        }

        var websiteName = request.WebsiteName.Trim();
        var websiteLogoFileId = request.WebsiteLogoFileId.Trim();
        var adminUsername = request.AdminUsername.Trim();
        var adminPassword = request.AdminPassword.Trim();
        var templateCode = request.TemplateCode.Trim();

        if (platform.Configuration is null)
        {
            platform.Configuration = new PlatformConfiguration
            {
                Id = Guid.NewGuid(),
                PlatformId = platform.Id,
                WebsiteName = websiteName,
                WebsiteLogoFileId = websiteLogoFileId,
                AdminUsername = adminUsername,
                AdminPassword = adminPassword,
                TemplateCode = templateCode,
                Slug = platform.TenantSlug,
            };
            _dbContext.PlatformConfigurations.Add(platform.Configuration);
        }
        else
        {
            platform.Configuration.WebsiteName = websiteName;
            platform.Configuration.WebsiteLogoFileId = websiteLogoFileId;
            platform.Configuration.AdminUsername = adminUsername;
            platform.Configuration.AdminPassword = adminPassword;
            platform.Configuration.TemplateCode = templateCode;
            platform.Configuration.Slug = platform.TenantSlug;
        }

        platform.UpdatedAtUtc = DateTime.UtcNow;
        await SaveReservingSlugAsync(cancellationToken);

        if (isShop && platform.TenantId is null && platform.TenantSlug is not null)
        {
            await ProvisionShopAsync(platform, cancellationToken);
        }

        return await GetUserPlatformAsync(userId, platformId, cancellationToken);
    }

    public async Task<UserPlatformDetailDto> RetryProvisioningAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default)
    {
        var platform = await LoadOwnedPlatformAsync(userId, platformId, cancellationToken);
        EnsureShopPlatform(platform);

        if (platform.TenantId is not null && platform.ProvisioningStatus == SiteProvisioningStatus.Ready)
        {
            throw new ConflictException("سایت این پلتفرم قبلاً ساخته شده است.");
        }

        if (string.IsNullOrWhiteSpace(platform.TenantSlug))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["slug"] = ["آدرس سایت (slug) تعیین نشده است."],
            });
        }

        await ProvisionShopAsync(platform, cancellationToken);

        return await GetUserPlatformAsync(userId, platformId, cancellationToken);
    }

    public async Task<ShopSsoRedirectDto> CreateShopSsoRedirectAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default)
    {
        var platform = await _dbContext.UserPlatforms
            .AsNoTracking()
            .Include(item => item.Plan)
            .FirstOrDefaultAsync(
                item => item.Id == platformId && item.UserId == userId,
                cancellationToken)
            ?? throw new NotFoundException("پلتفرم یافت نشد.");

        EnsureShopPlatform(platform);

        if (platform.ProvisioningStatus != SiteProvisioningStatus.Ready ||
            string.IsNullOrWhiteSpace(platform.TenantSlug) ||
            string.IsNullOrWhiteSpace(platform.TenantAdminEmail))
        {
            throw new ConflictException("سایت هنوز آماده نیست.");
        }

        var sso = await _shopClient.CreateSsoCodeAsync(
            platform.TenantSlug,
            platform.TenantAdminEmail,
            cancellationToken);

        var adminUrl = string.IsNullOrWhiteSpace(platform.AdminUrl)
            ? _shopClient.BuildAdminUrl(platform.TenantSlug)
            : platform.AdminUrl;

        var separator = adminUrl.Contains('?') ? '&' : '?';
        var redirectUrl = $"{adminUrl}{separator}sso_code={Uri.EscapeDataString(sso.Code)}";

        return new ShopSsoRedirectDto(redirectUrl);
    }

    public async Task<IReadOnlyList<AdminSiteListItemDto>> GetAdminSitesAsync(
        CancellationToken cancellationToken = default)
    {
        var query =
            from platform in _dbContext.UserPlatforms.AsNoTracking()
            where platform.Plan.ProductType == PlanProductType.Shop
            join user in _dbContext.Users.AsNoTracking() on platform.UserId equals user.Id
            orderby platform.CreatedAtUtc descending
            select new AdminSiteListItemDto(
                platform.Id,
                platform.UserId,
                user.Email,
                user.PhoneNumber,
                (user.FirstName + " " + user.LastName).Trim(),
                platform.PlanId,
                platform.Plan.Name,
                platform.Plan.ProductType,
                platform.Name,
                platform.TenantSlug,
                platform.TenantId,
                platform.StorefrontUrl,
                platform.AdminUrl,
                platform.ProvisioningStatus,
                platform.ProvisioningError,
                platform.IsActive,
                platform.CreatedAtUtc);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken = default)
    {
        var platform = await _dbContext.UserPlatforms
            .FirstOrDefaultAsync(
                item => item.Id == platformId && item.UserId == userId,
                cancellationToken)
            ?? throw new NotFoundException("پلتفرم یافت نشد.");

        await DeleteShopTenantBestEffortAsync(platform, cancellationToken);

        _dbContext.UserPlatforms.Remove(platform);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AdminDeleteSiteAsync(
        Guid platformId,
        CancellationToken cancellationToken = default)
    {
        var platform = await _dbContext.UserPlatforms
            .Include(item => item.Plan)
            .FirstOrDefaultAsync(item => item.Id == platformId, cancellationToken)
            ?? throw new NotFoundException("سایت یافت نشد.");

        if (platform.Plan.ProductType != PlanProductType.Shop)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["platformId"] = ["این رکورد از نوع فروشگاه نیست."],
            });
        }

        await DeleteShopTenantRequiredAsync(platform, cancellationToken);

        _dbContext.UserPlatforms.Remove(platform);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AdminSetSiteActiveAsync(
        Guid platformId,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        var platform = await _dbContext.UserPlatforms
            .Include(item => item.Plan)
            .FirstOrDefaultAsync(item => item.Id == platformId, cancellationToken)
            ?? throw new NotFoundException("سایت یافت نشد.");

        if (platform.Plan.ProductType != PlanProductType.Shop)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["platformId"] = ["این رکورد از نوع فروشگاه نیست."],
            });
        }

        if (string.IsNullOrWhiteSpace(platform.TenantSlug))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["platformId"] = ["فروشگاه هنوز ساخته نشده و قابل تعلیق/فعال‌سازی نیست."],
            });
        }

        try
        {
            await _shopClient.SetTenantActiveAsync(platform.TenantSlug, isActive, cancellationToken);
        }
        catch (ShopProvisioningException exception)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["shop"] = [exception.Message],
            });
        }

        platform.IsActive = isActive;
        platform.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task DeleteShopTenantRequiredAsync(
        UserPlatform platform,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(platform.TenantSlug))
        {
            return;
        }

        try
        {
            await _shopClient.DeleteTenantAsync(platform.TenantSlug, cancellationToken);
        }
        catch (ShopProvisioningException exception)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["shop"] = [exception.Message],
            });
        }
    }

    private async Task DeleteShopTenantBestEffortAsync(
        UserPlatform platform,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(platform.TenantSlug))
        {
            return;
        }

        try
        {
            await _shopClient.DeleteTenantAsync(platform.TenantSlug, cancellationToken);
        }
        catch (ShopProvisioningException exception)
        {
            _logger.LogWarning(
                exception,
                "Failed to delete shop tenant {Slug} for platform {PlatformId}.",
                platform.TenantSlug,
                platform.Id);
        }
    }

    private async Task<UserPlatform> LoadOwnedPlatformAsync(
        Guid userId,
        Guid platformId,
        CancellationToken cancellationToken) =>
        await _dbContext.UserPlatforms
            .Include(item => item.Configuration)
            .Include(item => item.Plan)
            .FirstOrDefaultAsync(
                item => item.Id == platformId && item.UserId == userId,
                cancellationToken)
        ?? throw new NotFoundException("پلتفرم یافت نشد.");

    private static void EnsureShopPlatform(UserPlatform platform)
    {
        if (platform.Plan.ProductType != PlanProductType.Shop)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["planId"] = ["پلن این پلتفرم از نوع فروشگاه نیست."],
            });
        }
    }

    /// <summary>
    /// Creates the tenant in apollo.shop.api and records the outcome on the platform.
    /// Shop failures are stored on the platform (Failed) instead of thrown.
    /// </summary>
    private async Task ProvisionShopAsync(UserPlatform platform, CancellationToken cancellationToken)
    {
        var slug = platform.TenantSlug!;

        platform.ProvisioningStatus = SiteProvisioningStatus.Pending;
        platform.ProvisioningError = null;
        platform.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var owner = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == platform.UserId)
            .Select(user => new { user.FirstName, user.LastName })
            .FirstOrDefaultAsync(cancellationToken);

        var configuration = platform.Configuration;
        var adminEmail = BuildAdminEmail(slug, configuration?.AdminUsername);
        var adminPassword = string.IsNullOrWhiteSpace(configuration?.AdminPassword)
            ? GeneratePassword()
            : configuration.AdminPassword;

        var request = new ShopCreateTenantRequest(
            slug,
            platform.Name,
            adminEmail,
            adminPassword,
            string.IsNullOrWhiteSpace(owner?.FirstName) ? "Admin" : owner.FirstName,
            string.IsNullOrWhiteSpace(owner?.LastName) ? "User" : owner.LastName,
            string.IsNullOrWhiteSpace(configuration?.WebsiteName) ? platform.Name : configuration.WebsiteName,
            null,
            platform.UserId);

        try
        {
            var result = await _shopClient.CreateTenantAsync(request, cancellationToken);

            platform.TenantId = result.TenantId;
            platform.TenantSlug = result.Slug;
            platform.TenantAdminEmail = result.AdminEmail;
            platform.StorefrontUrl = _shopClient.BuildStorefrontUrl(result.Slug);
            platform.AdminUrl = _shopClient.BuildAdminUrl(result.Slug);
            platform.ProvisioningStatus = SiteProvisioningStatus.Ready;
            platform.ProvisioningError = null;
            platform.IsActive = true;
        }
        catch (ShopProvisioningException exception)
        {
            _logger.LogWarning(
                exception,
                "Shop provisioning failed for platform {PlatformId} (slug {Slug}).",
                platform.Id,
                slug);

            platform.ProvisioningStatus = SiteProvisioningStatus.Failed;
            platform.ProvisioningError = Truncate(exception.Message, MaxProvisioningErrorLength);
        }

        platform.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string BuildAdminEmail(string slug, string? adminUsername)
    {
        var username = adminUsername?.Trim().ToLowerInvariant();
        if (!string.IsNullOrEmpty(username) && new EmailAddressAttribute().IsValid(username))
        {
            return username;
        }

        var local = Regex.Replace(username ?? string.Empty, "[^a-z0-9._-]", string.Empty);
        if (local.Length > 64)
        {
            local = local[..64];
        }

        if (local.Length == 0)
        {
            local = "admin";
        }

        return $"{local}@{slug}.apollo.local";
    }

    private static string GeneratePassword() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(18));

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];

    private async Task ValidateSlugAsync(
        string slug,
        Guid? excludePlatformId,
        CancellationToken cancellationToken)
    {
        if (!SiteSlug.IsValid(slug))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["slug"] = ["آدرس سایت فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد (حداکثر ۶۳ کاراکتر)."],
            });
        }

        if (SiteSlug.IsReserved(slug))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["slug"] = ["این آدرس رزرو شده است."],
            });
        }

        var taken = await _dbContext.UserPlatforms
            .AsNoTracking()
            .AnyAsync(
                platform => platform.TenantSlug == slug && platform.Id != excludePlatformId,
                cancellationToken);

        if (taken)
        {
            throw SlugTakenException();
        }
    }

    private async Task SaveReservingSlugAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (IsSlugIndexViolation(exception))
        {
            throw SlugTakenException();
        }
    }

    private static bool IsSlugIndexViolation(DbUpdateException exception) =>
        exception.InnerException?.Message.Contains("Slug", StringComparison.OrdinalIgnoreCase) == true;

    private static ValidationException SlugTakenException() =>
        new(new Dictionary<string, string[]>
        {
            ["slug"] = ["این آدرس قبلاً استفاده شده است."],
        });

    private async Task<UserPlatformDetailDto> MapDetailAsync(
        UserPlatform platform,
        CancellationToken cancellationToken)
    {
        PlatformSettingsDto settings;
        if (platform.Configuration is null)
        {
            settings = new PlatformSettingsDto(
                string.Empty,
                string.Empty,
                null,
                string.Empty,
                string.Empty,
                string.Empty,
                platform.TenantSlug);
        }
        else
        {
            var logoUrl = await _fileAccessService.ResolveAccessUrlAsync(
                platform.Configuration.WebsiteLogoFileId,
                cancellationToken);

            settings = new PlatformSettingsDto(
                platform.Configuration.WebsiteName,
                platform.Configuration.WebsiteLogoFileId,
                logoUrl,
                platform.Configuration.AdminUsername,
                platform.Configuration.AdminPassword,
                platform.Configuration.TemplateCode,
                platform.Configuration.Slug ?? platform.TenantSlug);
        }

        var availableTemplates = new List<PlatformTemplateOptionDto>(platform.Plan.Templates.Count);
        foreach (var template in platform.Plan.Templates.OrderBy(item => item.Title))
        {
            var imageUrl = await _fileAccessService.ResolveAccessUrlAsync(
                template.ImageFileId,
                cancellationToken);

            availableTemplates.Add(new PlatformTemplateOptionDto(
                template.Code,
                template.Title,
                imageUrl));
        }

        return new UserPlatformDetailDto(
            platform.Id,
            platform.PlanId,
            platform.Plan.Name,
            platform.Name,
            platform.CreatedAtUtc,
            settings,
            availableTemplates,
            platform.Plan.ProductType,
            platform.TenantId,
            platform.TenantSlug,
            platform.StorefrontUrl,
            platform.AdminUrl,
            platform.ProvisioningStatus,
            platform.ProvisioningError);
    }

    private async Task ValidateLogoFileAsync(
        string websiteLogoFileId,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(websiteLogoFileId, out var fileId))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["websiteLogoFileId"] = ["شناسه لوگوی وبسایت معتبر نیست."],
            });
        }

        var exists = await _dbContext.StoredFiles
            .AsNoTracking()
            .AnyAsync(
                file => file.Id == fileId &&
                        (file.Purpose == FileStorageRules.PlanImagePurpose ||
                         file.Purpose == FileStorageRules.GeneralUploadPurpose),
                cancellationToken);

        if (!exists)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["websiteLogoFileId"] = ["لوگوی وبسایت یافت نشد."],
            });
        }
    }

    private static void ValidateTemplateCode(Plan plan, string templateCode)
    {
        var normalized = templateCode.Trim();
        if (plan.Templates.All(template =>
                !string.Equals(template.Code, normalized, StringComparison.Ordinal)))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["templateCode"] = ["قالب انتخاب‌شده برای این پلن معتبر نیست."],
            });
        }
    }

    private async Task<Plan> ValidatePlanAsync(Guid planId, CancellationToken cancellationToken)
    {
        var plan = await _dbContext.Plans
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == planId, cancellationToken);

        if (plan is null)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["planId"] = ["پلن انتخاب‌شده یافت نشد."],
            });
        }

        if (!plan.IsAvailable || !plan.IsPublished)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["planId"] = ["پلن انتخاب‌شده در حال حاضر در دسترس نیست."],
            });
        }

        return plan;
    }

    private static UserPlatformListItemDto MapListItem(UserPlatform platform) =>
        new(
            platform.Id,
            platform.PlanId,
            platform.Plan.Name,
            platform.Name,
            platform.CreatedAtUtc,
            platform.Plan.ProductType,
            platform.TenantId,
            platform.TenantSlug,
            platform.StorefrontUrl,
            platform.AdminUrl,
            platform.ProvisioningStatus,
            platform.ProvisioningError);
}
