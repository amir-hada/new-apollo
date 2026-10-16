using ApolloShop.Application.Features.Account.Commands;
using ApolloShop.Application.Features.Account.DTOs;
using ApolloShop.Application.Features.Account.Queries;
using ApolloShop.Application.Features.ShopSettings.Commands;
using ApolloShop.Application.Features.ShopSettings.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountController(IMediator mediator) => _mediator = mediator;

    [HttpGet("profile")]
    public async Task<ActionResult<ProfileDto>> GetProfile(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetProfileQuery(), cancellationToken));

    [HttpPut("profile")]
    public async Task<ActionResult<ProfileDto>> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateProfileCommand(request), cancellationToken));

    [HttpPost("avatar")]
    [RequestSizeLimit(2 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 2 * 1024 * 1024)]
    public async Task<ActionResult<ProfileDto>> UploadAvatar(
        IFormFile? file,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { detail = "فایل انتخاب نشده است." });
        }

        await using var stream = file.OpenReadStream();
        var uploaded = await _mediator.Send(
            new UploadShopAssetCommand(
                stream,
                file.FileName,
                file.ContentType,
                "avatar",
                file.Length),
            cancellationToken);

        var current = await _mediator.Send(new GetProfileQuery(), cancellationToken);
        var profile = await _mediator.Send(
            new UpdateProfileCommand(new UpdateProfileRequest(
                current.FirstName,
                current.LastName,
                current.PhoneNumber,
                uploaded.Url)),
            cancellationToken);

        return Ok(profile);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        await _mediator.Send(
            new ChangePasswordCommand(request.CurrentPassword, request.NewPassword),
            cancellationToken);
        return NoContent();
    }
}
