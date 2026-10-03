using Apollo.Application.Abstractions.Storage;
using Apollo.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Storage;

public sealed class FileAccessService : IFileAccessService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FileAccessService(
        ApplicationDbContext dbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string?> ResolveAccessUrlAsync(
        string? storedValue,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storedValue))
        {
            return null;
        }

        if (storedValue.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            storedValue.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return storedValue;
        }

        if (Guid.TryParse(storedValue, out var fileId))
        {
            var exists = await _dbContext.StoredFiles
                .AsNoTracking()
                .AnyAsync(file => file.Id == fileId, cancellationToken);

            return exists ? BuildProtectedFileUrl(fileId) : null;
        }

        return null;
    }

    public string BuildProtectedFileUrl(Guid fileId)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request is null)
        {
            return $"/api/files/{fileId}";
        }

        return $"{request.Scheme}://{request.Host}/api/files/{fileId}";
    }
}
