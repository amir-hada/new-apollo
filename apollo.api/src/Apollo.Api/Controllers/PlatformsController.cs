using Apollo.Application.Common.Exceptions;
using Apollo.Application.Common.Models;
using Apollo.Application.Features.Platforms.Commands.CreateShopSso;
using Apollo.Application.Features.Platforms.Commands.CreateUserPlatform;
using Apollo.Application.Features.Platforms.Commands.RetryProvisioning;
using Apollo.Domain.Constants;
using Apollo.Application.Features.Platforms.Commands.DeleteUserPlatform;
using Apollo.Application.Features.Platforms.Commands.UpdatePlatformSettings;
using Apollo.Application.Features.Platforms.Queries.GetPlanOptions;
using Apollo.Application.Features.Platforms.Queries.GetUserPlatform;
using Apollo.Application.Features.Platforms.Queries.GetUserPlatforms;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Apollo.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/platforms")]
public sealed class PlatformsController : ControllerBase
{
    private readonly ISender _sender;

    public PlatformsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlatforms(CancellationToken cancellationToken)
    {
        var platforms = await _sender.Send(
            new GetUserPlatformsQuery(GetUserId()),
            cancellationToken);

        return Ok(platforms);
    }

    [HttpGet("{platformId:guid}")]
    public async Task<IActionResult> GetPlatform(
        Guid platformId,
        CancellationToken cancellationToken)
    {
        var platform = await _sender.Send(
            new GetUserPlatformQuery(GetUserId(), platformId),
            cancellationToken);

        return Ok(platform);
    }

    [HttpGet("plan-options")]
    public async Task<IActionResult> GetPlanOptions(
        [FromQuery] PlanProductType? productType,
        CancellationToken cancellationToken)
    {
        var plans = await _sender.Send(new GetPlanOptionsQuery(productType), cancellationToken);
        return Ok(plans);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlatform(
        [FromBody] CreateUserPlatformRequest request,
        CancellationToken cancellationToken)
    {
        var platform = await _sender.Send(
            new CreateUserPlatformCommand(GetUserId(), request),
            cancellationToken);

        return Created($"/api/platforms/{platform.PlatformId}", platform);
    }

    [HttpPut("{platformId:guid}/settings")]
    public async Task<IActionResult> UpdatePlatformSettings(
        Guid platformId,
        [FromBody] UpdatePlatformSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var platform = await _sender.Send(
            new UpdatePlatformSettingsCommand(GetUserId(), platformId, request),
            cancellationToken);

        return Ok(platform);
    }

    [HttpPost("{platformId:guid}/retry-provisioning")]
    public async Task<IActionResult> RetryProvisioning(
        Guid platformId,
        CancellationToken cancellationToken)
    {
        var platform = await _sender.Send(
            new RetryPlatformProvisioningCommand(GetUserId(), platformId),
            cancellationToken);

        return Ok(platform);
    }

    [HttpPost("{platformId:guid}/shop-sso")]
    public async Task<IActionResult> CreateShopSso(
        Guid platformId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new CreateShopSsoCommand(GetUserId(), platformId),
            cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{platformId:guid}")]
    public async Task<IActionResult> DeletePlatform(
        Guid platformId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new DeleteUserPlatformCommand(GetUserId(), platformId),
            cancellationToken);

        return Ok(new { message = "پلتفرم با موفقیت حذف شد." });
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedException("کاربر احراز هویت نشده است.");
        }

        return userId;
    }
}
