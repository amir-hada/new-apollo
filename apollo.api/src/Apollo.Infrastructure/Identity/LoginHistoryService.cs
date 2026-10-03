using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Identity;

public sealed class LoginHistoryService : ILoginHistoryService
{
    private const int RetentionCount = 20;

    private readonly ApplicationDbContext _dbContext;

    public LoginHistoryService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task RecordLoginAsync(
        Guid userId,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        var entry = new LoginHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LoggedInAtUtc = DateTime.UtcNow,
            IpAddress = NormalizeIpAddress(ipAddress),
            UserAgent = Truncate(userAgent, 512),
        };

        _dbContext.LoginHistories.Add(entry);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await TrimOldEntriesAsync(userId, cancellationToken);
    }

    public async Task<IReadOnlyList<LoginHistoryDto>> GetRecentLoginsAsync(
        Guid userId,
        int count,
        CancellationToken cancellationToken)
    {
        var take = Math.Clamp(count, 1, 20);

        var entries = await _dbContext.LoginHistories
            .AsNoTracking()
            .Where(entry => entry.UserId == userId)
            .OrderByDescending(entry => entry.LoggedInAtUtc)
            .Take(take)
            .ToListAsync(cancellationToken);

        return entries
            .Select(entry => new LoginHistoryDto(
                entry.Id,
                entry.LoggedInAtUtc,
                entry.IpAddress,
                UserAgentParser.ParseDevice(entry.UserAgent)))
            .ToList();
    }

    private async Task TrimOldEntriesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var staleEntryIds = await _dbContext.LoginHistories
            .Where(entry => entry.UserId == userId)
            .OrderByDescending(entry => entry.LoggedInAtUtc)
            .Skip(RetentionCount)
            .Select(entry => entry.Id)
            .ToListAsync(cancellationToken);

        if (staleEntryIds.Count == 0)
        {
            return;
        }

        await _dbContext.LoginHistories
            .Where(entry => staleEntryIds.Contains(entry.Id))
            .ExecuteDeleteAsync(cancellationToken);
    }

    private static string NormalizeIpAddress(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            return "نامشخص";
        }

        if (ipAddress == "::1")
        {
            return "127.0.0.1";
        }

        return Truncate(ipAddress.Trim(), 45);
    }

    private static string Truncate(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }
}
