namespace Apollo.Application.Abstractions.Storage;

public interface IFileStorageService
{
    Task<Guid> UploadProfilePictureAsync(
        Guid userId,
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<Guid> UploadAsync(
        Guid userId,
        string purpose,
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<(Stream Stream, string ContentType)?> OpenReadAsync(
        Guid fileId,
        Guid requestingUserId,
        bool allowAnyOwner = false,
        CancellationToken cancellationToken = default);

    Task<(Stream Stream, string ContentType)?> OpenPublicPlanImageAsync(
        Guid fileId,
        CancellationToken cancellationToken = default);

    Task<(Stream Stream, string ContentType)?> OpenReadByObjectKeyAsync(
        string objectKey,
        Guid requestingUserId,
        bool allowAnyOwner = false,
        CancellationToken cancellationToken = default);

    Task RemoveProfilePictureAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task DeleteAllUserFilesAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task DeleteFileByIdAsync(
        Guid fileId,
        CancellationToken cancellationToken = default);
}
