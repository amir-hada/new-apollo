namespace Apollo.Application.Common.Models;

public sealed record StoredFileDto(
    Guid FileId,
    string ObjectKey,
    string ContentType,
    long SizeBytes,
    string Purpose,
    string AccessUrl);

public sealed record UploadFileResultDto(
    StoredFileDto File,
    string? ProfilePictureUrl);
