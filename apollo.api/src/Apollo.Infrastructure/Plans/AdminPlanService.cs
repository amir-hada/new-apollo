using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Plans;

public sealed class AdminPlanService : IAdminPlanService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IFileAccessService _fileAccessService;
    private readonly IFileStorageService _fileStorageService;

    public AdminPlanService(
        ApplicationDbContext dbContext,
        IFileAccessService fileAccessService,
        IFileStorageService fileStorageService)
    {
        _dbContext = dbContext;
        _fileAccessService = fileAccessService;
        _fileStorageService = fileStorageService;
    }

    public async Task<IReadOnlyList<AdminPlanListItemDto>> GetPlansAsync(
        CancellationToken cancellationToken = default)
    {
        var plans = await _dbContext.Plans
            .AsNoTracking()
            .Include(plan => plan.Properties.OrderBy(feature => feature.SortOrder))
            .Include(plan => plan.Templates)
            .AsSplitQuery()
            .OrderByDescending(plan => plan.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var result = new List<AdminPlanListItemDto>(plans.Count);

        foreach (var plan in plans)
        {
            result.Add(await MapPlanAsync(plan, cancellationToken));
        }

        return result;
    }

    public async Task<AdminPlanListItemDto> GetPlanByIdAsync(
        Guid planId,
        CancellationToken cancellationToken = default)
    {
        var plan = await _dbContext.Plans
            .AsNoTracking()
            .Include(item => item.Properties.OrderBy(feature => feature.SortOrder))
            .Include(item => item.Templates)
            .AsSplitQuery()
            .FirstOrDefaultAsync(item => item.Id == planId, cancellationToken)
            ?? throw new NotFoundException("پلن یافت نشد.");

        return await MapPlanAsync(plan, cancellationToken);
    }

    public async Task<AdminPlanListItemDto> CreatePlanAsync(
        CreatePlanRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateBillingPeriod(request.BillingPeriod);
        ValidatePricing(request.PriceInToman, request.DiscountedPriceInToman);
        await ValidateImageFileAsync(request.ImageFileId, cancellationToken);

        var now = DateTime.UtcNow;
        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            ImageFileId = NormalizeImageFileId(request.ImageFileId),
            Description = request.Description.Trim(),
            PriceInToman = request.PriceInToman,
            DiscountedPriceInToman = request.DiscountedPriceInToman,
            IsAvailable = request.IsAvailable,
            AllowsInstallment = request.AllowsInstallment,
            IsPublished = false,
            BillingPeriod = request.BillingPeriod,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        _dbContext.Plans.Add(plan);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetPlanByIdAsync(plan.Id, cancellationToken);
    }

    public async Task<AdminPlanListItemDto> UpdatePlanAsync(
        Guid planId,
        UpdatePlanRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateBillingPeriod(request.BillingPeriod);
        ValidatePricing(request.PriceInToman, request.DiscountedPriceInToman);
        await ValidateImageFileAsync(request.ImageFileId, cancellationToken);

        // فقط خود پلن — بدون Include تا children در ChangeTracker نمانند
        var plan = await _dbContext.Plans
            .FirstOrDefaultAsync(item => item.Id == planId, cancellationToken)
            ?? throw new NotFoundException("پلن یافت نشد.");

        var nextImageFileId = NormalizeImageFileId(request.ImageFileId);
        Guid? previousImageFileIdToDelete = null;
        if (!string.Equals(plan.ImageFileId, nextImageFileId, StringComparison.Ordinal) &&
            !string.IsNullOrWhiteSpace(plan.ImageFileId) &&
            Guid.TryParse(plan.ImageFileId, out var previousImageFileId))
        {
            previousImageFileIdToDelete = previousImageFileId;
        }

        plan.Name = request.Name.Trim();
        plan.ImageFileId = nextImageFileId;
        plan.Description = request.Description.Trim();
        plan.PriceInToman = request.PriceInToman;
        plan.DiscountedPriceInToman = request.DiscountedPriceInToman;
        plan.IsAvailable = request.IsAvailable;
        plan.AllowsInstallment = request.AllowsInstallment;
        plan.IsPublished = request.IsPublished;
        plan.BillingPeriod = request.BillingPeriod;
        plan.UpdatedAtUtc = DateTime.UtcNow;

        await ReplacePlanChildrenAsync(
            planId,
            request.Properties,
            request.Templates,
            cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (previousImageFileIdToDelete is { } fileIdToDelete)
        {
            await _fileStorageService.DeleteFileByIdAsync(fileIdToDelete, cancellationToken);
        }

        return await GetPlanByIdAsync(planId, cancellationToken);
    }

    public async Task DeletePlanAsync(
        Guid planId,
        CancellationToken cancellationToken = default)
    {
        var plan = await _dbContext.Plans
            .FirstOrDefaultAsync(item => item.Id == planId, cancellationToken)
            ?? throw new NotFoundException("پلن یافت نشد.");

        if (!string.IsNullOrWhiteSpace(plan.ImageFileId) &&
            Guid.TryParse(plan.ImageFileId, out var imageFileId))
        {
            await _fileStorageService.DeleteFileByIdAsync(imageFileId, cancellationToken);
        }

        await _dbContext.PlanProperties
            .Where(feature => feature.PlanId == planId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.PlanTemplates
            .Where(template => template.PlanId == planId)
            .ExecuteDeleteAsync(cancellationToken);

        _dbContext.Plans.Remove(plan);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ReplacePlanChildrenAsync(
        Guid planId,
        IReadOnlyList<PlanPropertyDto> properties,
        IReadOnlyList<PlanTemplateDto> templates,
        CancellationToken cancellationToken)
    {
        await _dbContext.PlanProperties
            .Where(feature => feature.PlanId == planId)
            .ExecuteDeleteAsync(cancellationToken);
        await _dbContext.PlanTemplates
            .Where(template => template.PlanId == planId)
            .ExecuteDeleteAsync(cancellationToken);

        for (var index = 0; index < properties.Count; index++)
        {
            var feature = properties[index];
            _dbContext.PlanProperties.Add(new PlanProperty
            {
                Id = Guid.NewGuid(),
                PlanId = planId,
                Title = feature.Title.Trim(),
                Value = feature.Value.Trim(),
                SortOrder = index,
            });
        }

        foreach (var template in templates)
        {
            await ValidateImageFileAsync(template.ImageFileId, cancellationToken);

            _dbContext.PlanTemplates.Add(new PlanTemplate
            {
                Id = Guid.NewGuid(),
                PlanId = planId,
                Title = template.Title.Trim(),
                Code = template.Code.Trim(),
                ImageFileId = template.ImageFileId.Trim(),
            });
        }
    }

    private async Task<AdminPlanListItemDto> MapPlanAsync(
        Plan plan,
        CancellationToken cancellationToken)
    {
        var imageUrl = await _fileAccessService.ResolveAccessUrlAsync(
            plan.ImageFileId,
            cancellationToken);

        var templates = new List<PlanTemplateDto>(plan.Templates.Count);
        foreach (var template in plan.Templates.OrderBy(item => item.Title))
        {
            var templateImageUrl = await _fileAccessService.ResolveAccessUrlAsync(
                template.ImageFileId,
                cancellationToken);

            templates.Add(new PlanTemplateDto(
                template.Title,
                template.Code,
                template.ImageFileId,
                templateImageUrl));
        }

        return new AdminPlanListItemDto(
            plan.Id,
            plan.Name,
            imageUrl,
            plan.ImageFileId,
            plan.Description,
            plan.PriceInToman,
            plan.DiscountedPriceInToman,
            plan.IsAvailable,
            plan.AllowsInstallment,
            plan.IsPublished,
            plan.BillingPeriod,
            plan.Properties
                .OrderBy(feature => feature.SortOrder)
                .Select(feature => new PlanPropertyDto(feature.Title, feature.Value))
                .ToList(),
            templates,
            plan.CreatedAtUtc);
    }

    private async Task ValidateImageFileAsync(
        string? imageFileId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(imageFileId))
        {
            return;
        }

        if (!Guid.TryParse(imageFileId, out var fileId))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["imageFileId"] = ["شناسه تصویر معتبر نیست."],
            });
        }

        var exists = await _dbContext.StoredFiles
            .AsNoTracking()
            .AnyAsync(
                file => file.Id == fileId &&
                        file.Purpose == FileStorageRules.PlanImagePurpose,
                cancellationToken);

        if (!exists)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["imageFileId"] = ["تصویر پلن یافت نشد."],
            });
        }
    }

    private static void ValidateBillingPeriod(string billingPeriod)
    {
        if (!PlanBillingPeriod.All.Contains(billingPeriod, StringComparer.Ordinal))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["billingPeriod"] = ["بازه زمانی پلن معتبر نیست."],
            });
        }
    }

    private static void ValidatePricing(long priceInToman, long? discountedPriceInToman)
    {
        if (priceInToman <= 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["priceInToman"] = ["قیمت باید بیشتر از صفر باشد."],
            });
        }

        if (discountedPriceInToman is <= 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["discountedPriceInToman"] = ["قیمت با تخفیف باید بیشتر از صفر باشد."],
            });
        }

        if (discountedPriceInToman is not null && discountedPriceInToman >= priceInToman)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["discountedPriceInToman"] = ["قیمت با تخفیف باید کمتر از قیمت اصلی باشد."],
            });
        }
    }

    private static string? NormalizeImageFileId(string? imageFileId) =>
        string.IsNullOrWhiteSpace(imageFileId) ? null : imageFileId.Trim();
}
