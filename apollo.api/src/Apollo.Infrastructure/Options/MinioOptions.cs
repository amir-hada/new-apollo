namespace Apollo.Infrastructure.Options;

public sealed class MinioOptions
{
    public const string SectionName = "Minio";

    public string Endpoint { get; set; } = "localhost:9000";

    public string AccessKey { get; set; } = string.Empty;

    public string SecretKey { get; set; } = string.Empty;

    public string BucketName { get; set; } = "apollo";

    public bool UseSsl { get; set; }

    public int PresignedUrlExpirySeconds { get; set; } = 3600;
}
