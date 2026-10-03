namespace Apollo.Domain.Constants;

public static class FileStorageRules
{
    public const long MaxProfilePictureBytes = 1_048_576;

    public const int MaxOriginalUploadBytes = 5_242_880;

    public const int ProfilePictureMaxDimension = 512;

    public const string ProfilePicturePurpose = "profile-picture";

    public const string GeneralUploadPurpose = "general";

    public const string PlanImagePurpose = "plan-image";

    public const string ProfilePictureContentType = "image/webp";

    public static readonly string[] AllowedImageContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];
}
