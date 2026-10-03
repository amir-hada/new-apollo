using ApolloShop.Application.Features.Tickets.Commands;
using ApolloShop.Application.Features.Tickets.DTOs;
using ApolloShop.Application.Features.Tickets.Queries;
using ApolloShop.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/tickets")]
public class TicketsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TicketsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] TicketStatus? status = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetTicketsQuery(page, pageSize, status, search), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetTicketByIdQuery(id), cancellationToken));

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTicketRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new AssignTicketCommand(id, request.AssignedToUserId), cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new UpdateTicketStatusCommand(id, request.Status), cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/priority")]
    public async Task<IActionResult> UpdatePriority(Guid id, [FromBody] UpdateTicketPriorityRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new UpdateTicketPriorityCommand(id, request.Priority), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/replies")]
    public async Task<IActionResult> Reply(Guid id, [FromBody] ReplyTicketRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new AdminReplyCommand(id, request.Message), cancellationToken));
}
