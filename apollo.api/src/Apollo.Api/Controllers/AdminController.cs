using System.Security.Claims;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Features.Admin.Commands.CreatePlan;
using Apollo.Application.Features.Admin.Commands.DeletePlan;
using Apollo.Application.Features.Admin.Commands.DeleteUser;
using Apollo.Application.Features.Admin.Commands.SetUserActiveStatus;
using Apollo.Application.Features.Admin.Commands.UpdatePlan;
using Apollo.Application.Features.Admin.Queries.GetPlanById;
using Apollo.Application.Features.Admin.Queries.GetPlans;
using Apollo.Application.Features.Admin.Queries.GetUsers;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apollo.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin")]
public sealed class AdminController : ControllerBase
{
    private readonly ISender _sender;

    public AdminController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _sender.Send(new GetUsersQuery(), cancellationToken);
        return Ok(users);
    }

    [HttpPatch("users/{userId:guid}/status")]
    public async Task<IActionResult> SetUserStatus(
        Guid userId,
        [FromBody] SetUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new SetUserActiveStatusCommand(userId, request.IsActive, GetUserId()),
            cancellationToken);

        return Ok(new
        {
            message = request.IsActive
                ? UserAccessMessages.UserActivated
                : UserAccessMessages.UserDeactivated,
        });
    }

    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUser(
        Guid userId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new DeleteUserCommand(userId, GetUserId()),
            cancellationToken);

        return Ok(new { message = UserAccessMessages.UserDeleted });
    }

    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans(CancellationToken cancellationToken)
    {
        var plans = await _sender.Send(new GetPlansQuery(), cancellationToken);
        return Ok(plans);
    }

    [HttpGet("plans/{planId:guid}")]
    public async Task<IActionResult> GetPlanById(
        Guid planId,
        CancellationToken cancellationToken)
    {
        var plan = await _sender.Send(new GetPlanByIdQuery(planId), cancellationToken);
        return Ok(plan);
    }

    [HttpPost("plans")]
    public async Task<IActionResult> CreatePlan(
        [FromBody] CreatePlanRequest request,
        CancellationToken cancellationToken)
    {
        var plan = await _sender.Send(
            new CreatePlanCommand(
                request.Name,
                request.ImageFileId,
                request.Description,
                request.PriceInToman,
                request.DiscountedPriceInToman,
                request.IsAvailable,
                request.AllowsInstallment,
                request.BillingPeriod),
            cancellationToken);

        return Created($"/api/admin/plans/{plan.PlanId}", plan);
    }

    [HttpPut("plans/{planId:guid}")]
    public async Task<IActionResult> UpdatePlan(
        Guid planId,
        [FromBody] UpdatePlanRequest request,
        CancellationToken cancellationToken)
    {
        var plan = await _sender.Send(
            new UpdatePlanCommand(
                planId,
                request.Name,
                request.ImageFileId,
                request.Description,
                request.PriceInToman,
                request.DiscountedPriceInToman,
                request.IsAvailable,
                request.AllowsInstallment,
                request.IsPublished,
                request.BillingPeriod,
                request.Properties,
                request.Templates),
            cancellationToken);

        return Ok(plan);
    }

    [HttpDelete("plans/{planId:guid}")]
    public async Task<IActionResult> DeletePlan(
        Guid planId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(new DeletePlanCommand(planId), cancellationToken);
        return Ok(new { message = "پلن با موفقیت حذف شد." });
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedException("کاربر احراز هویت نشده است.");
        }

        return userId;
    }
}

public sealed record SetUserStatusRequest(bool IsActive);
