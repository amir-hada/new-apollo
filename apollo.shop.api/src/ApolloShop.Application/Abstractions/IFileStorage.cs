namespace ApolloShop.Application.Abstractions;

public interface IFileStorage
{
    Task<string> SaveAsync(
        Stream content,
        string fileName,
        string folder,
        string contentType,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(string pathOrUrl, CancellationToken cancellationToken = default);
}
