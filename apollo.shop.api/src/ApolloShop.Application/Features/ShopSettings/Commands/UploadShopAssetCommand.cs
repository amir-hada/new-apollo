using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;

namespace ApolloShop.Application.Features.ShopSettings.Commands;

public record UploadShopAssetCommand(
    Stream Content,
    string FileName,
    string ContentType,
    string Folder,
    long Size) : IRequest<UploadFileResultDto>;

public class UploadShopAssetCommandHandler : IRequestHandler<UploadShopAssetCommand, UploadFileResultDto>
{
    private static readonly HashSet<string> ImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
        "image/x-icon",
        "image/vnd.microsoft.icon",
        "image/gif"
    };

    private static readonly HashSet<string> VideoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4",
        "video/webm",
        "video/quicktime"
    };

    private static readonly HashSet<string> AllowedFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "logo",
        "favicon",
        "shop",
        "avatar",
        "hero",
        "story"
    };

    private const long MaxImageBytes = 5 * 1024 * 1024;
    private const long MaxVideoBytes = 50 * 1024 * 1024;

    private readonly IFileStorage _storage;

    public UploadShopAssetCommandHandler(IFileStorage storage) => _storage = storage;

    public async Task<UploadFileResultDto> Handle(UploadShopAssetCommand request, CancellationToken cancellationToken)
    {
        if (request.Size <= 0)
        {
            throw new ValidationException("فایل خالی است.");
        }

        if (!AllowedFolders.Contains(request.Folder))
        {
            throw new ValidationException("پوشه آپلود نامعتبر است.");
        }

        var contentType = string.IsNullOrWhiteSpace(request.ContentType)
            ? "application/octet-stream"
            : request.ContentType;

        var isImage = ImageContentTypes.Contains(contentType);
        var isVideo = VideoContentTypes.Contains(contentType);

        if (!isImage && !isVideo)
        {
            throw new ValidationException("فقط فایل‌های تصویری یا ویدیویی مجاز هستند.");
        }

        if (isVideo && !string.Equals(request.Folder, "shop", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("آپلود ویدیو فقط برای رسانه محصول مجاز است.");
        }

        var maxBytes = isVideo ? MaxVideoBytes : MaxImageBytes;
        if (request.Size > maxBytes)
        {
            throw new ValidationException(
                isVideo
                    ? "حداکثر حجم ویدیو ۵۰ مگابایت است."
                    : "حداکثر حجم تصویر ۵ مگابایت است.");
        }

        var url = await _storage.SaveAsync(
            request.Content,
            request.FileName,
            request.Folder,
            contentType,
            cancellationToken);

        return new UploadFileResultDto(url, Path.GetFileName(request.FileName), contentType, request.Size);
    }
}
