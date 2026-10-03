using ApolloShop.Application.Features.ShopSettings.Commands;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/uploads")]
public class UploadsController : ControllerBase
{
    private readonly IMediator _mediator;

    public UploadsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [RequestSizeLimit(2 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 2 * 1024 * 1024)]
    public async Task<ActionResult<UploadFileResultDto>> Upload(
        IFormFile? file,
        [FromQuery] string folder = "shop",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { detail = "فایل انتخاب نشده است." });
        }

        await using var stream = file.OpenReadStream();
        var result = await _mediator.Send(
            new UploadShopAssetCommand(
                stream,
                file.FileName,
                file.ContentType,
                folder,
                file.Length),
            cancellationToken);

        return Ok(result);
    }
}
