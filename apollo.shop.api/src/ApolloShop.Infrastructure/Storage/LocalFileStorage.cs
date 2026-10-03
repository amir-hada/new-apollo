using ApolloShop.Application.Abstractions;
using ApolloShop.Infrastructure.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace ApolloShop.Infrastructure.Storage;

public class LocalFileStorage : IFileStorage
{
    private readonly IWebHostEnvironment _environment;
    private readonly StorageOptions _options;

    public LocalFileStorage(IWebHostEnvironment environment, IOptions<StorageOptions> options)
    {
        _environment = environment;
        _options = options.Value;
    }

    public async Task<string> SaveAsync(
        Stream content,
        string fileName,
        string folder,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        _ = contentType;
        var safeName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        var relativeFolder = Path.Combine(_options.RootPath.Replace("wwwroot/", string.Empty), folder);
        var absoluteFolder = Path.Combine(
            _environment.ContentRootPath,
            "wwwroot",
            relativeFolder.Replace('\\', '/').TrimStart('/'));
        Directory.CreateDirectory(absoluteFolder);

        var absolutePath = Path.Combine(absoluteFolder, safeName);
        await using var fileStream = File.Create(absolutePath);
        await content.CopyToAsync(fileStream, cancellationToken);

        return $"{_options.PublicBasePath.TrimEnd('/')}/{folder.Trim('/')}/{safeName}".Replace('\\', '/');
    }

    public Task DeleteAsync(string pathOrUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(pathOrUrl))
        {
            return Task.CompletedTask;
        }

        var trimmed = pathOrUrl.TrimStart('/').Replace("media/", string.Empty, StringComparison.OrdinalIgnoreCase);
        var absolutePath = Path.Combine(_environment.ContentRootPath, "wwwroot", "media", trimmed);
        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }

        return Task.CompletedTask;
    }
}
