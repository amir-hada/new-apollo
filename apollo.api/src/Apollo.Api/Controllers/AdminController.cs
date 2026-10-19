using System.Security.Claims;
using Apollo.Application.Abstractions.Sms;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Features.Admin.Commands.CreatePlan;
using Apollo.Application.Features.Admin.Commands.DeletePlan;
using Apollo.Application.Features.Admin.Commands.DeleteSite;
using Apollo.Application.Features.Admin.Commands.DeleteUser;
using Apollo.Application.Features.Admin.Commands.SetSiteActiveStatus;
using Apollo.Application.Features.Admin.Commands.SetUserActiveStatus;
using Apollo.Application.Features.Admin.Commands.UpdatePlan;
using Apollo.Application.Features.Admin.Queries.GetPlanById;
using Apollo.Application.Features.Admin.Queries.GetPlans;
using Apollo.Application.Features.Admin.Queries.GetSites;
using Apollo.Application.Features.Admin.Queries.GetUsers;
using Apollo.Application.Abstractions.Support;
using Apollo.Application.Features.Support.Commands.ReplySupportTicket;
using Apollo.Application.Features.Support.Commands.UpdateSupportTicketPriority;
using Apollo.Application.Features.Support.Commands.UpdateSupportTicketStatus;
using Apollo.Application.Features.Support.Queries.GetAdminSupportTickets;
using Apollo.Application.Features.Support.Queries.GetSupportTicketById;
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
    private readonly IPlatformSmsSettingsService _smsSettings;

    public AdminController(ISender sender, IPlatformSmsSettingsService smsSettings)
    {
        _sender = sender;
        _smsSettings = smsSettings;
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

    [HttpGet("sites")]
    public async Task<IActionResult> GetSites(CancellationToken cancellationToken)
    {
        var sites = await _sender.Send(new GetAdminSitesQuery(), cancellationToken);
        return Ok(sites);
    }

    [HttpPatch("sites/{platformId:guid}/status")]
    public async Task<IActionResult> SetSiteStatus(
        Guid platformId,
        [FromBody] SetUserStatusRequest request,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new SetAdminSiteActiveStatusCommand(platformId, request.IsActive),
            cancellationToken);

        return Ok(new
        {
            message = request.IsActive
                ? "سایت با موفقیت فعال شد."
                : "سایت با موفقیت تعلیق شد.",
        });
    }

    [HttpDelete("sites/{platformId:guid}")]
    public async Task<IActionResult> DeleteSite(
        Guid platformId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteAdminSiteCommand(platformId), cancellationToken);
        return Ok(new { message = "سایت با موفقیت حذف شد." });
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
                request.BillingPeriod,
                request.ProductType),
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
                request.Templates,
                request.ProductType),
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

    [HttpGet("support/tickets")]
    public async Task<IActionResult> GetSupportTickets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] SupportTicketStatusDto? status = null,
        [FromQuery] SupportTicketPriorityDto? priority = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetAdminSupportTicketsQuery(page, pageSize, status, priority, search),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("support/tickets/{ticketId:guid}")]
    public async Task<IActionResult> GetSupportTicket(
        Guid ticketId,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new GetSupportTicketByIdQuery(ticketId, null, AsAdmin: true),
            cancellationToken);

        return Ok(ticket);
    }

    [HttpPost("support/tickets/{ticketId:guid}/replies")]
    public async Task<IActionResult> ReplySupportTicket(
        Guid ticketId,
        [FromBody] ReplySupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new ReplySupportTicketCommand(GetUserId(), ticketId, request, AsStaff: true),
            cancellationToken);

        return Ok(ticket);
    }

    [HttpPatch("support/tickets/{ticketId:guid}/status")]
    public async Task<IActionResult> UpdateSupportTicketStatus(
        Guid ticketId,
        [FromBody] UpdateSupportTicketStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new UpdateSupportTicketStatusCommand(GetUserId(), ticketId, request),
            cancellationToken);

        return Ok(ticket);
    }

    [HttpPatch("support/tickets/{ticketId:guid}/priority")]
    public async Task<IActionResult> UpdateSupportTicketPriority(
        Guid ticketId,
        [FromBody] UpdateSupportTicketPriorityRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new UpdateSupportTicketPriorityCommand(GetUserId(), ticketId, request),
            cancellationToken);

        return Ok(ticket);
    }

    [HttpGet("sms-settings")]
    public async Task<IActionResult> GetSmsSettings(CancellationToken cancellationToken)
    {
        var settings = await _smsSettings.GetAsync(cancellationToken);
        return Ok(settings);
    }

    [HttpPut("sms-settings")]
    public async Task<IActionResult> UpdateSmsSettings(
        [FromBody] UpdatePlatformSmsSettingsRequest request,
        CancellationToken cancellationToken)
    {
        var settings = await _smsSettings.UpdateAsync(request, cancellationToken);
        return Ok(settings);
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
