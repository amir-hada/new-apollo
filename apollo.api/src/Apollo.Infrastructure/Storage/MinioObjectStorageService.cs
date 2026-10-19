using Apollo.Infrastructure.Options;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Apollo.Infrastructure.Storage;

public sealed class MinioObjectStorageService
{
    private readonly IAmazonS3? _client;
    private readonly MinioOptions _options;
    private readonly ILogger<MinioObjectStorageService> _logger;
    private readonly SemaphoreSlim _bucketLock = new(1, 1);
    private readonly string? _localRoot;
    private readonly bool _useLocal;
    private bool _bucketReady;

    public MinioObjectStorageService(
        IOptions<MinioOptions> options,
        IHostEnvironment environment,
        ILogger<MinioObjectStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _useLocal = string.IsNullOrWhiteSpace(_options.AccessKey)
            || string.IsNullOrWhiteSpace(_options.SecretKey)
            || string.IsNullOrWhiteSpace(_options.Endpoint)
            || string.Equals(_options.AccessKey, "local", StringComparison.OrdinalIgnoreCase);

        if (_useLocal)
        {
            var bucket = string.IsNullOrWhiteSpace(_options.BucketName) ? "apollo" : _options.BucketName;
            _localRoot = Path.Combine(environment.ContentRootPath, "App_Data", "object-storage", bucket);
            Directory.CreateDirectory(_localRoot);
            _logger.LogWarning(
                "S3/libreFS credentials are not configured; using local object storage at {RootPath}",
                _localRoot);
            return;
        }

        var scheme = _options.UseSsl ? "https" : "http";
        var config = new AmazonS3Config
        {
            AuthenticationRegion = "us-east-1",
            RegionEndpoint = RegionEndpoint.USEast1,
            ServiceURL = $"{scheme}://{_options.Endpoint}",
            ForcePathStyle = true,
            UseHttp = !_options.UseSsl,
            RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
            ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED,
        };

        _client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
    }

    public async Task EnsureBucketAsync(CancellationToken cancellationToken = default)
    {
        if (_useLocal || _bucketReady)
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

            var buckets = await _client!.ListBucketsAsync(cancellationToken);
            var exists = buckets.Buckets.Any(b =>
                string.Equals(b.BucketName, _options.BucketName, StringComparison.Ordinal));

            if (!exists)
            {
                await _client.PutBucketAsync(_options.BucketName, cancellationToken);
                _logger.LogInformation("Created object-storage bucket {Bucket}", _options.BucketName);
            }

            _bucketReady = true;
        }
        finally
        {
            _bucketLock.Release();
        }
    }

    public async Task UploadAsync(
        string objectKey,
        Stream content,
        long size,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        if (_useLocal)
        {
            var path = ResolveLocalPath(objectKey);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            await using var file = File.Create(path);
            await content.CopyToAsync(file, cancellationToken);
            return;
        }

        await EnsureBucketAsync(cancellationToken);

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = content,
            AutoCloseStream = false,
            ContentType = contentType,
        };

        await _client!.PutObjectAsync(request, cancellationToken);
    }

    public async Task<Stream?> OpenReadAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        if (_useLocal)
        {
            var path = ResolveLocalPath(objectKey);
            if (!File.Exists(path))
            {
                return null;
            }

            return new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        }

        await EnsureBucketAsync(cancellationToken);

        try
        {
            var response = await _client!.GetObjectAsync(
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
        if (_useLocal)
        {
            var path = ResolveLocalPath(objectKey);
            if (File.Exists(path))
            {
                File.Delete(path);
            }

            return;
        }

        await EnsureBucketAsync(cancellationToken);

        await _client!.DeleteObjectAsync(
            new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = objectKey,
            },
            cancellationToken);
    }

    public Task<string> GetPresignedUrlAsync(string objectKey)
    {
        if (_useLocal)
        {
            return Task.FromResult(objectKey);
        }

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddSeconds(_options.PresignedUrlExpirySeconds),
        };

        return Task.FromResult(_client!.GetPreSignedURL(request));
    }

    private string ResolveLocalPath(string objectKey)
    {
        var relative = objectKey.Replace('\\', '/').TrimStart('/');
        var full = Path.GetFullPath(Path.Combine(
            _localRoot!,
            relative.Replace('/', Path.DirectorySeparatorChar)));
        if (!full.StartsWith(_localRoot!, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid object key.");
        }

        return full;
    }
}
