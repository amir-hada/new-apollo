using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Exceptions;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Storage;

public sealed class FileStorageService : IFileStorageService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly MinioObjectStorageService _objectStorage;
    private readonly ImageProcessor _imageProcessor;

    public FileStorageService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        MinioObjectStorageService objectStorage,
        ImageProcessor imageProcessor)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _objectStorage = objectStorage;
        _imageProcessor = imageProcessor;
    }

    public async Task<Guid> UploadProfilePictureAsync(
        Guid userId,
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        await ValidateImageUploadAsync(content, contentType, cancellationToken);

        var (processedBytes, processedContentType) =
            await _imageProcessor.ProcessProfilePictureAsync(content, cancellationToken);

        var objectKey = $"profiles/{userId}/avatar.webp";
        await using var uploadStream = new MemoryStream(processedBytes);
        await _objectStorage.UploadAsync(
            objectKey,
            uploadStream,
            processedBytes.Length,
            processedContentType,
            cancellationToken);

        var storedFile = await SaveStoredFileAsync(
            userId,
            objectKey,
            originalFileName,
            processedContentType,
            processedBytes.Length,
            FileStorageRules.ProfilePicturePurpose,
            cancellationToken);

        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("کاربر یافت نشد.");

        if (Guid.TryParse(user.ProfilePictureUrl, out var previousFileId) &&
            previousFileId != storedFile.Id)
        {
            await TryDeleteStoredFileAsync(previousFileId, userId, cancellationToken);
        }

        user.ProfilePictureUrl = storedFile.Id.ToString();
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["file"] = updateResult.Errors.Select(error => error.Description).ToArray(),
            });
        }

        return storedFile.Id;
    }

    public async Task<Guid> UploadAsync(
        Guid userId,
        string purpose,
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        if (content.Length > FileStorageRules.MaxOriginalUploadBytes)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["file"] = ["حجم فایل بیش از حد مجاز است."],
            });
        }

        var extension = Path.GetExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = ".bin";
        }

        var objectKey = $"uploads/{purpose}/{userId}/{Guid.NewGuid():N}{extension}";
        await using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, cancellationToken);
        var bytes = buffer.ToArray();

        await using var uploadStream = new MemoryStream(bytes);
        await _objectStorage.UploadAsync(
            objectKey,
            uploadStream,
            bytes.Length,
            contentType,
            cancellationToken);

        var storedFile = await SaveStoredFileAsync(
            userId,
            objectKey,
            originalFileName,
            contentType,
            bytes.Length,
            purpose,
            cancellationToken);

        return storedFile.Id;
    }

    public async Task<(Stream Stream, string ContentType)?> OpenReadAsync(
        Guid fileId,
        Guid requestingUserId,
        bool allowAnyOwner = false,
        CancellationToken cancellationToken = default)
    {
        var storedFile = await _dbContext.StoredFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(file => file.Id == fileId, cancellationToken);

        if (storedFile is null ||
            (!allowAnyOwner && storedFile.OwnerUserId != requestingUserId))
        {
            return null;
        }

        var stream = await _objectStorage.OpenReadAsync(storedFile.ObjectKey, cancellationToken);
        if (stream is null)
        {
            return null;
        }

        return (stream, storedFile.ContentType);
    }

    public async Task<(Stream Stream, string ContentType)?> OpenPublicPlanImageAsync(
        Guid fileId,
        CancellationToken cancellationToken = default)
    {
        var storedFile = await _dbContext.StoredFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                file => file.Id == fileId &&
                        file.Purpose == FileStorageRules.PlanImagePurpose,
                cancellationToken);

        if (storedFile is null)
        {
            return null;
        }

        var stream = await _objectStorage.OpenReadAsync(storedFile.ObjectKey, cancellationToken);
        if (stream is null)
        {
            return null;
        }

        return (stream, storedFile.ContentType);
    }

    public async Task<(Stream Stream, string ContentType)?> OpenReadByObjectKeyAsync(
        string objectKey,
        Guid requestingUserId,
        bool allowAnyOwner = false,
        CancellationToken cancellationToken = default)
    {
        var storedFile = await _dbContext.StoredFiles
            .AsNoTracking()
            .FirstOrDefaultAsync(file => file.ObjectKey == objectKey, cancellationToken);

        if (storedFile is null ||
            (!allowAnyOwner && storedFile.OwnerUserId != requestingUserId))
        {
            return null;
        }

        return await OpenReadAsync(storedFile.Id, requestingUserId, allowAnyOwner, cancellationToken);
    }

    public async Task RemoveProfilePictureAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("کاربر یافت نشد.");

        if (!Guid.TryParse(user.ProfilePictureUrl, out var fileId))
        {
            user.ProfilePictureUrl = null;
            await _userManager.UpdateAsync(user);
            return;
        }

        await TryDeleteStoredFileAsync(fileId, userId, cancellationToken);
        user.ProfilePictureUrl = null;
        await _userManager.UpdateAsync(user);
    }

    public async Task DeleteAllUserFilesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var storedFiles = await _dbContext.StoredFiles
            .Where(file => file.OwnerUserId == userId)
            .ToListAsync(cancellationToken);

        foreach (var storedFile in storedFiles)
        {
            await _objectStorage.DeleteAsync(storedFile.ObjectKey, cancellationToken);
            _dbContext.StoredFiles.Remove(storedFile);
        }

        if (storedFiles.Count > 0)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteFileByIdAsync(
        Guid fileId,
        CancellationToken cancellationToken = default)
    {
        var storedFile = await _dbContext.StoredFiles
            .FirstOrDefaultAsync(file => file.Id == fileId, cancellationToken);

        if (storedFile is null)
        {
            return;
        }

        await _objectStorage.DeleteAsync(storedFile.ObjectKey, cancellationToken);
        _dbContext.StoredFiles.Remove(storedFile);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<StoredFile> SaveStoredFileAsync(
        Guid userId,
        string objectKey,
        string originalFileName,
        string contentType,
        long sizeBytes,
        string purpose,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.StoredFiles
            .FirstOrDefaultAsync(
                file => file.ObjectKey == objectKey && file.OwnerUserId == userId,
                cancellationToken);

        if (existing is not null)
        {
            existing.OriginalFileName = originalFileName;
            existing.ContentType = contentType;
            existing.SizeBytes = sizeBytes;
            existing.Purpose = purpose;
            existing.CreatedAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return existing;
        }

        var storedFile = new StoredFile
        {
            Id = Guid.NewGuid(),
            OwnerUserId = userId,
            ObjectKey = objectKey,
            OriginalFileName = originalFileName,
            ContentType = contentType,
            SizeBytes = sizeBytes,
            Purpose = purpose,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _dbContext.StoredFiles.Add(storedFile);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return storedFile;
    }

    private async Task TryDeleteStoredFileAsync(
        Guid fileId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var storedFile = await _dbContext.StoredFiles
            .FirstOrDefaultAsync(
                file => file.Id == fileId && file.OwnerUserId == userId,
                cancellationToken);

        if (storedFile is null)
        {
            return;
        }

        await _objectStorage.DeleteAsync(storedFile.ObjectKey, cancellationToken);
        _dbContext.StoredFiles.Remove(storedFile);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task ValidateImageUploadAsync(
        Stream content,
        string contentType,
        CancellationToken cancellationToken)
    {
        if (!ImageProcessor.IsAllowedImageContentType(contentType))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["file"] = ["فرمت تصویر مجاز نیست. فقط JPG، PNG و WebP پشتیبانی می‌شود."],
            });
        }

        var header = new byte[12];
        var read = await content.ReadAsync(header.AsMemory(0, header.Length), cancellationToken);
        content.Position = 0;

        if (!ImageProcessor.HasAllowedImageSignature(header.AsSpan(0, read)))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["file"] = ["فایل ارسالی یک تصویر معتبر نیست."],
            });
        }
    }
}
