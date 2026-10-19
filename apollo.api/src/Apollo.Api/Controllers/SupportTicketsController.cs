using System.Security.Claims;
using Apollo.Application.Abstractions.Support;
using Apollo.Application.Features.Support.Commands.CreateSupportTicket;
using Apollo.Application.Features.Support.Commands.ReplySupportTicket;
using Apollo.Application.Features.Support.Queries.GetMySupportTickets;
using Apollo.Application.Features.Support.Queries.GetSupportTicketById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apollo.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/support/tickets")]
public sealed class SupportTicketsController : ControllerBase
{
    private readonly ISender _sender;

    public SupportTicketsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyTickets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetMySupportTicketsQuery(GetUserId(), page, pageSize),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{ticketId:guid}")]
    public async Task<IActionResult> GetMyTicket(
        Guid ticketId,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new GetSupportTicketByIdQuery(ticketId, GetUserId(), AsAdmin: false),
            cancellationToken);

        return Ok(ticket);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket(
        [FromBody] CreateSupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new CreateSupportTicketCommand(GetUserId(), request),
            cancellationToken);

        return Created($"/api/support/tickets/{ticket.Id}", ticket);
    }

    [HttpPost("{ticketId:guid}/replies")]
    public async Task<IActionResult> Reply(
        Guid ticketId,
        [FromBody] ReplySupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _sender.Send(
            new ReplySupportTicketCommand(GetUserId(), ticketId, request, AsStaff: false),
            cancellationToken);

        return Ok(ticket);
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdValue!);
    }
}
