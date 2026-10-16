using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Abstractions.Shop;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Exceptions;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apollo.Infrastructure.Identity;

public sealed class AdminUserService : IAdminUserService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IFileStorageService _fileStorageService;
    private readonly IShopProvisioningClient _shopClient;
    private readonly ILogger<AdminUserService> _logger;

    public AdminUserService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IFileStorageService fileStorageService,
        IShopProvisioningClient shopClient,
        ILogger<AdminUserService> logger)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _fileStorageService = fileStorageService;
        _shopClient = shopClient;
        _logger = logger;
    }

    public async Task SetUserActiveStatusAsync(
        Guid userId,
        bool isActive,
        Guid requestedByUserId,
        CancellationToken cancellationToken)
    {
        if (userId == requestedByUserId)
        {
            throw new ConflictException(UserAccessMessages.CannotModifySelf);
        }

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken)
            ?? throw new NotFoundException("کاربر یافت نشد.");

        if (!isActive)
        {
            await EnsureNotLastActiveAdminAsync(user, cancellationToken);
        }

        if (user.IsActive == isActive)
        {
            return;
        }

        user.IsActive = isActive;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["user"] = updateResult.Errors.Select(error => error.Description).ToArray(),
            });
        }

        if (!isActive)
        {
            await RevokeUserSessionsAsync(userId, cancellationToken);
        }
    }

    public async Task DeleteUserAsync(
        Guid userId,
        Guid requestedByUserId,
        CancellationToken cancellationToken)
    {
        if (userId == requestedByUserId)
        {
            throw new ConflictException(UserAccessMessages.CannotModifySelf);
        }

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken)
            ?? throw new NotFoundException("کاربر یافت نشد.");

        await EnsureNotLastActiveAdminAsync(user, cancellationToken);

        var platformSlugs = await _dbContext.UserPlatforms
            .AsNoTracking()
            .Where(platform =>
                platform.UserId == userId &&
                platform.TenantSlug != null &&
                platform.TenantSlug != "")
            .Select(platform => platform.TenantSlug!)
            .ToListAsync(cancellationToken);

        foreach (var slug in platformSlugs)
        {
            try
            {
                await _shopClient.DeleteTenantAsync(slug, cancellationToken);
            }
            catch (ShopProvisioningException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Failed to delete shop tenant {Slug} while removing user {UserId}.",
                    slug,
                    userId);
            }
        }

        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            await _dbContext.PhoneOtps
                .Where(otp => otp.MobileNumber == user.PhoneNumber)
                .ExecuteDeleteAsync(cancellationToken);
        }

        await _fileStorageService.DeleteAllUserFilesAsync(userId, cancellationToken);

        var deleteResult = await _userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["user"] = deleteResult.Errors.Select(error => error.Description).ToArray(),
            });
        }
    }

    private async Task EnsureNotLastActiveAdminAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        if (!await _userManager.IsInRoleAsync(user, AppRoles.Admin))
        {
            return;
        }

        var adminRoleId = await _dbContext.Roles
            .AsNoTracking()
            .Where(role => role.Name == AppRoles.Admin)
            .Select(role => role.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (adminRoleId == Guid.Empty)
        {
            return;
        }

        var activeAdminCount = await (
            from userRole in _dbContext.UserRoles
            join adminUser in _dbContext.Users on userRole.UserId equals adminUser.Id
            where userRole.RoleId == adminRoleId && adminUser.IsActive
            select adminUser.Id
        ).CountAsync(cancellationToken);

        if (activeAdminCount <= 1)
        {
            throw new ConflictException(UserAccessMessages.CannotDeleteLastAdmin);
        }
    }

    private Task RevokeUserSessionsAsync(Guid userId, CancellationToken cancellationToken) =>
        _dbContext.RefreshTokens
            .Where(token => token.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);
}
