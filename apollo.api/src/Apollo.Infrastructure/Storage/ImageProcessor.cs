using Apollo.Application.Common.Exceptions;
using Apollo.Domain.Constants;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Apollo.Infrastructure.Storage;

public sealed class ImageProcessor
{
    public async Task<(byte[] Data, string ContentType)> ProcessProfilePictureAsync(
        Stream input,
        CancellationToken cancellationToken = default)
    {
        if (input.Length > FileStorageRules.MaxOriginalUploadBytes)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["file"] = ["حجم فایل ورودی بیش از حد مجاز است."],
            });
        }

        using var image = await Image.LoadAsync(input, cancellationToken);

        image.Mutate(ctx =>
        {
            ctx.AutoOrient();
            ctx.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(
                    FileStorageRules.ProfilePictureMaxDimension,
                    FileStorageRules.ProfilePictureMaxDimension),
            });
        });

        var quality = 85;
        byte[] output;

        while (true)
        {
            await using var memoryStream = new MemoryStream();
            await image.SaveAsync(
                memoryStream,
                new WebpEncoder { Quality = quality },
                cancellationToken);

            output = memoryStream.ToArray();
            if (output.Length <= FileStorageRules.MaxProfilePictureBytes || quality <= 40)
            {
                break;
            }

            quality -= 10;
        }

        if (output.Length > FileStorageRules.MaxProfilePictureBytes)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["file"] = ["حجم تصویر پس از پردازش باید حداکثر ۱ مگابایت باشد."],
            });
        }

        return (output, FileStorageRules.ProfilePictureContentType);
    }

    public static bool IsAllowedImageContentType(string contentType) =>
        FileStorageRules.AllowedImageContentTypes.Contains(
            contentType.Trim().ToLowerInvariant());

    public static bool HasAllowedImageSignature(ReadOnlySpan<byte> header)
    {
        if (header.Length >= 3 &&
            header[0] == 0xFF &&
            header[1] == 0xD8 &&
            header[2] == 0xFF)
        {
            return true;
        }

        if (header.Length >= 8 &&
            header[0] == 0x89 &&
            header[1] == 0x50 &&
            header[2] == 0x4E &&
            header[3] == 0x47)
        {
            return true;
        }

        if (header.Length >= 12 &&
            header[0] == 0x52 &&
            header[1] == 0x49 &&
            header[2] == 0x46 &&
            header[3] == 0x46 &&
            header[8] == 0x57 &&
            header[9] == 0x45 &&
            header[10] == 0x42 &&
            header[11] == 0x50)
        {
            return true;
        }

        return false;
    }
}
