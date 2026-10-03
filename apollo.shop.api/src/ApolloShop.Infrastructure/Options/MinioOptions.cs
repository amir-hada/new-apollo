namespace ApolloShop.Infrastructure.Options;

public class MinioOptions
{
    public const string SectionName = "Minio";

    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "apolloshop";
    public bool UseSsl { get; set; }
    public string PublicBaseUrl { get; set; } = "http://localhost:9000/apolloshop";
}
