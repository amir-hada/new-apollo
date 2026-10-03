using ApolloShop.Application.Features.Orders.Commands;
using ApolloShop.Application.Features.Orders.DTOs;
using ApolloShop.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetMyOrdersQuery(page, pageSize), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMineById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetMyOrderByIdQuery(id), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateOrderCommand(request.AddressId, request.Notes), cancellationToken));
}
