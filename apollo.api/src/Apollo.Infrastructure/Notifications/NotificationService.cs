using Apollo.Application.Abstractions.Notifications;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apollo.Infrastructure.Notifications;

public sealed class NotificationService : INotificationService
{
    private const int RetentionCount = 50;

    private readonly ApplicationDbContext _dbContext;
    private readonly INotificationPushClient _pushClient;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext dbContext,
        INotificationPushClient pushClient,
        ILogger<NotificationService> logger)
    {
        _dbContext = dbContext;
        _pushClient = pushClient;
        _logger = logger;
    }

    public async Task<NotificationDto> SendAsync(
        Guid userId,
        string type,
        string message,
        CancellationToken cancellationToken)
    {
        var notification = new UserNotification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type.Trim(),
            Message = message.Trim(),
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _dbContext.UserNotifications.Add(notification);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await TrimOldEntriesAsync(userId, cancellationToken);

        var dto = Map(notification);

        try
        {
            await _pushClient.PushAsync(userId, dto, cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(
                exception,
                "Failed to push notification {NotificationId} to user {UserId}",
                notification.Id,
                userId);
        }

        return dto;
    }

    public async Task EnsureProfileCompleteReminderAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user is null || IsProfileComplete(user))
        {
            return;
        }

        var alreadySent = await _dbContext.UserNotifications
            .AsNoTracking()
            .AnyAsync(
                notification =>
                    notification.UserId == userId &&
                    notification.Type == NotificationTypes.ProfileCompleteReminder,
                cancellationToken);

        if (alreadySent)
        {
            return;
        }

        await SendAsync(
            userId,
            NotificationTypes.ProfileCompleteReminder,
            NotificationMessages.ProfileCompleteReminder,
            cancellationToken);
    }

    public async Task<IReadOnlyList<NotificationDto>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var notifications = await _dbContext.UserNotifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAtUtc)
            .Take(RetentionCount)
            .ToListAsync(cancellationToken);

        return notifications.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<NotificationDto>> GetUnreadForUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var notifications = await _dbContext.UserNotifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .OrderByDescending(notification => notification.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return notifications.Select(Map).ToList();
    }

    public async Task<PagedResult<NotificationDto>> GetPagedForUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 50);

        var query = _dbContext.UserNotifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)normalizedPageSize);

        var notifications = await query
            .OrderByDescending(notification => notification.CreatedAtUtc)
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<NotificationDto>(
            notifications.Select(Map).ToList(),
            normalizedPage,
            normalizedPageSize,
            totalCount,
            totalPages);
    }

    public async Task<int> GetUnreadCountAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        await _dbContext.UserNotifications
            .AsNoTracking()
            .CountAsync(
                notification => notification.UserId == userId && !notification.IsRead,
                cancellationToken);

    public async Task MarkAllAsReadAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        await _dbContext.UserNotifications
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .ExecuteUpdateAsync(
                updates => updates.SetProperty(notification => notification.IsRead, true),
                cancellationToken);
    }

    private static bool IsProfileComplete(ApplicationUser user) =>
        !string.IsNullOrWhiteSpace(user.FirstName) &&
        !string.IsNullOrWhiteSpace(user.LastName) &&
        !string.IsNullOrWhiteSpace(user.Email) &&
        !string.IsNullOrWhiteSpace(user.NationalId);

    private async Task TrimOldEntriesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var staleIds = await _dbContext.UserNotifications
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAtUtc)
            .Skip(RetentionCount)
            .Select(notification => notification.Id)
            .ToListAsync(cancellationToken);

        if (staleIds.Count == 0)
        {
            return;
        }

        await _dbContext.UserNotifications
            .Where(notification => staleIds.Contains(notification.Id))
            .ExecuteDeleteAsync(cancellationToken);
    }

    private static NotificationDto Map(UserNotification notification) =>
        new(
            notification.Id,
            notification.Type,
            notification.Message,
            notification.IsRead,
            notification.CreatedAtUtc);
}
