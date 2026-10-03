using ApolloShop.Application.Features.Tickets.Commands;
using ApolloShop.Application.Features.Tickets.DTOs;
using ApolloShop.Application.Features.Tickets.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TicketsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetMyTicketsQuery(page, pageSize), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMineById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetMyTicketByIdQuery(id), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateTicketCommand(request), cancellationToken));

    [HttpPost("{id:guid}/replies")]
    public async Task<IActionResult> Reply(Guid id, [FromBody] ReplyTicketRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new ReplyTicketCommand(id, request.Message), cancellationToken));
}
