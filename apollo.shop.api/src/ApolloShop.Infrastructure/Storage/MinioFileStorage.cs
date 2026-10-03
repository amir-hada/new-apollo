using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using ApolloShop.Application.Abstractions;
using ApolloShop.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ApolloShop.Infrastructure.Storage;

public sealed class MinioFileStorage : IFileStorage
{
    private readonly IAmazonS3 _client;
    private readonly MinioOptions _options;
    private readonly ILogger<MinioFileStorage> _logger;
    private readonly SemaphoreSlim _bucketLock = new(1, 1);
    private bool _bucketReady;

    public MinioFileStorage(IOptions<MinioOptions> options, ILogger<MinioFileStorage> logger)
    {
        _options = options.Value;
        _logger = logger;

        var scheme = _options.UseSsl ? "https" : "http";
        var config = new AmazonS3Config
        {
            AuthenticationRegion = "us-east-1",
            RegionEndpoint = RegionEndpoint.USEast1,
            ServiceURL = $"{scheme}://{_options.Endpoint}",
            ForcePathStyle = true
        };

        _client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
    }

    public async Task<string> SaveAsync(
        Stream content,
        string fileName,
        string folder,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = contentType switch
            {
                "image/png" => ".png",
                "image/jpeg" or "image/jpg" => ".jpg",
                "image/webp" => ".webp",
                "image/svg+xml" => ".svg",
                "image/gif" => ".gif",
                "image/x-icon" or "image/vnd.microsoft.icon" => ".ico",
                "video/mp4" => ".mp4",
                "video/webm" => ".webm",
                "video/quicktime" => ".mov",
                _ => ".bin"
            };
        }

        var key = $"{folder.Trim('/').ToLowerInvariant()}/{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = content,
            AutoCloseStream = false,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };

        await _client.PutObjectAsync(request, cancellationToken);

        return $"{_options.PublicBaseUrl.TrimEnd('/')}/{key}";
    }

    public async Task DeleteAsync(string pathOrUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(pathOrUrl))
        {
            return;
        }

        try
        {
            await EnsureBucketAsync(cancellationToken);

            var key = ExtractKey(pathOrUrl);
            if (string.IsNullOrWhiteSpace(key))
            {
                return;
            }

            await _client.DeleteObjectAsync(
                new DeleteObjectRequest
                {
                    BucketName = _options.BucketName,
                    Key = key
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete object {Path}", pathOrUrl);
        }
    }

    private string ExtractKey(string pathOrUrl)
    {
        var publicBase = _options.PublicBaseUrl.TrimEnd('/') + "/";
        if (pathOrUrl.StartsWith(publicBase, StringComparison.OrdinalIgnoreCase))
        {
            return pathOrUrl[publicBase.Length..];
        }

        var bucketPrefix = $"/{_options.BucketName}/";
        var idx = pathOrUrl.IndexOf(bucketPrefix, StringComparison.OrdinalIgnoreCase);
        if (idx >= 0)
        {
            return pathOrUrl[(idx + bucketPrefix.Length)..];
        }

        return pathOrUrl.TrimStart('/');
    }

    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        if (_bucketReady)
        {
            return;
        }

        await _bucketLock.WaitAsync(cancellationToken);
        try
        {
            if (_bucketReady)
            {
                return;
            }

            var buckets = await _client.ListBucketsAsync(cancellationToken);
            var exists = buckets.Buckets.Any(b =>
                string.Equals(b.BucketName, _options.BucketName, StringComparison.Ordinal));

            if (!exists)
            {
                await _client.PutBucketAsync(_options.BucketName, cancellationToken);
                _logger.LogInformation("Created MinIO bucket {Bucket}", _options.BucketName);
            }

            var policy = $$"""
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": { "AWS": ["*"] },
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::{{_options.BucketName}}/*"]
                    }
                  ]
                }
                """;

            try
            {
                await _client.PutBucketPolicyAsync(
                    new PutBucketPolicyRequest
                    {
                        BucketName = _options.BucketName,
                        Policy = policy
                    },
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not set public policy on bucket {Bucket}", _options.BucketName);
            }

            _bucketReady = true;
        }
        finally
        {
            _bucketLock.Release();
        }
    }
}
