namespace Apollo.Application.Abstractions.Storage;

public interface IFileAccessService
{
    Task<string?> ResolveAccessUrlAsync(
        string? storedValue,
        CancellationToken cancellationToken = default);

    string BuildProtectedFileUrl(Guid fileId);
}
