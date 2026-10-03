using Apollo.Infrastructure.Options;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Apollo.Infrastructure.Storage;

public sealed class MinioObjectStorageService
{
    private readonly IAmazonS3 _client;
    private readonly MinioOptions _options;
    private readonly ILogger<MinioObjectStorageService> _logger;

    public MinioObjectStorageService(
        IOptions<MinioOptions> options,
        ILogger<MinioObjectStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;

        var scheme = _options.UseSsl ? "https" : "http";
        var config = new AmazonS3Config
        {
            AuthenticationRegion = "us-east-1",
            RegionEndpoint = RegionEndpoint.USEast1,
            ServiceURL = $"{scheme}://{_options.Endpoint}",
            ForcePathStyle = true,
        };

        _client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
    }

    public Task EnsureBucketAsync(CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    public async Task UploadAsync(
        string objectKey,
        Stream content,
        long size,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = content,
            AutoCloseStream = false,
            ContentType = contentType,
        };

        await _client.PutObjectAsync(request, cancellationToken);
    }

    public async Task<Stream?> OpenReadAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        try
        {
            var response = await _client.GetObjectAsync(
                new GetObjectRequest
                {
                    BucketName = _options.BucketName,
                    Key = objectKey,
                },
                cancellationToken);

            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (AmazonS3Exception exception) when (
            exception.StatusCode == System.Net.HttpStatusCode.NotFound ||
            exception.ErrorCode is "NoSuchKey" or "NotFound")
        {
            _logger.LogWarning("Object {ObjectKey} was not found in bucket {BucketName}", objectKey, _options.BucketName);
            return null;
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Failed to read object {ObjectKey}", objectKey);
            return null;
        }
    }

    public async Task DeleteAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        await _client.DeleteObjectAsync(
            new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = objectKey,
            },
            cancellationToken);
    }

    public Task<string> GetPresignedUrlAsync(string objectKey)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddSeconds(_options.PresignedUrlExpirySeconds),
        };

        return Task.FromResult(_client.GetPreSignedURL(request));
    }
}
