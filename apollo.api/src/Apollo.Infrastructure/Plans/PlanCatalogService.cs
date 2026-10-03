using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Models;
using Apollo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Plans;

public sealed class PlanCatalogService : IPlanCatalogService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IFileAccessService _fileAccessService;

    public PlanCatalogService(
        ApplicationDbContext dbContext,
        IFileAccessService fileAccessService)
    {
        _dbContext = dbContext;
        _fileAccessService = fileAccessService;
    }

    public async Task<IReadOnlyList<PublicPlanListItemDto>> GetPublicPlansAsync(
        CancellationToken cancellationToken = default)
    {
        var plans = await _dbContext.Plans
            .AsNoTracking()
            .Where(plan => plan.IsPublished)
            .Include(plan => plan.Properties.OrderBy(feature => feature.SortOrder))
            .OrderByDescending(plan => plan.IsAvailable)
            .ThenBy(plan => plan.PriceInToman)
            .ThenByDescending(plan => plan.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var result = new List<PublicPlanListItemDto>(plans.Count);

        foreach (var plan in plans)
        {
            var imageUrl = await _fileAccessService.ResolveAccessUrlAsync(
                plan.ImageFileId,
                cancellationToken);

            result.Add(new PublicPlanListItemDto(
                plan.Id,
                plan.Name,
                imageUrl,
                plan.Description,
                plan.PriceInToman,
                plan.DiscountedPriceInToman,
                plan.IsAvailable,
                plan.AllowsInstallment,
                plan.BillingPeriod,
                plan.Properties
                    .OrderBy(feature => feature.SortOrder)
                    .Select(feature => new PlanPropertyDto(feature.Title, feature.Value))
                    .ToList()));
        }

        return result;
    }
}
