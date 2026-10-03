using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Cart.Commands;
using ApolloShop.Application.Features.Cart.DTOs;
using ApolloShop.Application.Features.Cart.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public CartController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    private string? GuestToken => Request.Headers["X-Guest-Token"].FirstOrDefault();

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetCartQuery(_currentUser.UserId, GuestToken), cancellationToken));

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new AddCartItemCommand(_currentUser.UserId, GuestToken, request.ProductVariantId, request.Quantity, request.SelectedSpecValueIds), cancellationToken));

    [HttpPut("items/{id:guid}")]
    public async Task<ActionResult<CartDto>> UpdateItem(Guid id, [FromBody] UpdateCartItemRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateCartItemCommand(_currentUser.UserId, GuestToken, id, request.Quantity), cancellationToken));

    [HttpDelete("items/{id:guid}")]
    public async Task<ActionResult<CartDto>> RemoveItem(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new RemoveCartItemCommand(_currentUser.UserId, GuestToken, id), cancellationToken));
}
