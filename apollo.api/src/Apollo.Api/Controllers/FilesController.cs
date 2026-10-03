using System.Security.Claims;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apollo.Api.Controllers;

[ApiController]
[Route("api/files")]
[Authorize]
public sealed class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;
    private readonly IFileAccessService _fileAccessService;

    public FilesController(
        IFileStorageService fileStorageService,
        IFileAccessService fileAccessService)
    {
        _fileStorageService = fileStorageService;
        _fileAccessService = fileAccessService;
    }

    [HttpPost("profile-picture")]
    [RequestSizeLimit(FileStorageRules.MaxOriginalUploadBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = FileStorageRules.MaxOriginalUploadBytes)]
    public async Task<IActionResult> UploadProfilePicture(
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { detail = "فایل انتخاب نشده است." });
        }

        var userId = GetUserId();

        await using var sourceStream = file.OpenReadStream();
        await using var stream = new MemoryStream();
        await sourceStream.CopyToAsync(stream, cancellationToken);
        stream.Position = 0;

        var fileId = await _fileStorageService.UploadProfilePictureAsync(
            userId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        var accessUrl = await _fileAccessService.ResolveAccessUrlAsync(
            fileId.ToString(),
            cancellationToken);

        var response = new UploadFileResultDto(
            new StoredFileDto(
                fileId,
                $"profiles/{userId}/avatar.webp",
                FileStorageRules.ProfilePictureContentType,
                file.Length,
                FileStorageRules.ProfilePicturePurpose,
                accessUrl ?? string.Empty),
            accessUrl);

        return Ok(response);
    }

    [HttpDelete("profile-picture")]
    public async Task<IActionResult> RemoveProfilePicture(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _fileStorageService.RemoveProfilePictureAsync(userId, cancellationToken);
        return NoContent();
    }

    [HttpPost("upload")]
    [RequestSizeLimit(FileStorageRules.MaxOriginalUploadBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = FileStorageRules.MaxOriginalUploadBytes)]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromQuery] string purpose = FileStorageRules.GeneralUploadPurpose,
        CancellationToken cancellationToken = default)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { detail = "فایل انتخاب نشده است." });
        }

        var userId = GetUserId();

        await using var sourceStream = file.OpenReadStream();
        await using var stream = new MemoryStream();
        await sourceStream.CopyToAsync(stream, cancellationToken);
        stream.Position = 0;

        var fileId = await _fileStorageService.UploadAsync(
            userId,
            purpose,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        var accessUrl = _fileAccessService.BuildProtectedFileUrl(fileId);
        return Ok(new StoredFileDto(
            fileId,
            string.Empty,
            file.ContentType,
            file.Length,
            purpose,
            accessUrl));
    }

    [HttpGet("{fileId:guid}")]
    [AllowAnonymous]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Download(Guid fileId, CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var userId = GetUserId();
            var allowAnyOwner = User.IsInRole(AppRoles.Admin);
            var file = await _fileStorageService.OpenReadAsync(
                fileId,
                userId,
                allowAnyOwner,
                cancellationToken);

            if (file is not null)
            {
                return File(file.Value.Stream, file.Value.ContentType);
            }
        }

        var publicPlanImage = await _fileStorageService.OpenPublicPlanImageAsync(
            fileId,
            cancellationToken);

        if (publicPlanImage is null)
        {
            return NotFound();
        }

        return File(publicPlanImage.Value.Stream, publicPlanImage.Value.ContentType);
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException();
        }

        return userId;
    }
}
