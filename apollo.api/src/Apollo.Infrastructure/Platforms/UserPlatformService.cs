using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Platforms;

public sealed class UserPlatformService : IUserPlatformService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IFileAccessService _fileAccessService;

    public UserPlatformService(
        ApplicationDbContext dbContext,
        IFileAccessService fileAccessService)
    {
        _dbContext = dbContext;
        _fileAccessService = fileAccessService;
    }

    public async Task<IReadOnlyList<UserPlatformListItemDto>> GetUserPlatformsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.UserPlatforms
            .AsNoTracking()
            .Include(platform => platform.Plan)
            .Where(platform => platform.UserId == userId)
            .OrderByDescending(platform => platform.CreatedAtUtc)
            .Select(platform => new UserPlatformListItemDto(
                platform.Id,
                platform.PlanId,
                platform.Plan.Name,
                platform.Name,
                platform.CreatedAtUtc))
            .ToListAsync(cancellationToken);
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
        CancellationToken cancellationToken = default)
    {
        var plans = await _dbContext.Plans
            .AsNoTracking()
            .Where(plan => plan.IsAvailable && plan.IsPublished)
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
                plan.IsAvailable));
        }

        return result;
    }

    public async Task<UserPlatformListItemDto> CreateAsync(
        Guid userId,
        CreateUserPlatformRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidatePlanAsync(request.PlanId, cancellationToken);

        var now = DateTime.UtcNow;
        var platform = new UserPlatform
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlanId = request.PlanId,
            Name = request.Name.Trim(),
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        _dbContext.UserPlatforms.Add(platform);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _dbContext.Entry(platform)
            .Reference(item => item.Plan)
            .LoadAsync(cancellationToken);

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
        }

        platform.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetUserPlatformAsync(userId, platformId, cancellationToken);
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

        _dbContext.UserPlatforms.Remove(platform);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

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
                string.Empty);
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
                platform.Configuration.TemplateCode);
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
            availableTemplates);
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

    private async Task ValidatePlanAsync(Guid planId, CancellationToken cancellationToken)
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
    }

    private static UserPlatformListItemDto MapListItem(UserPlatform platform) =>
        new(
            platform.Id,
            platform.PlanId,
            platform.Plan.Name,
            platform.Name,
            platform.CreatedAtUtc);
}
