using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Products.Commands;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUser _currentUser;

    public ProductsController(IMediator mediator, ICurrentUser currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    private string? GuestToken => Request.Headers["X-Guest-Token"].FirstOrDefault();

    [HttpGet]
    public async Task<ActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? categorySlug = null,
        [FromQuery] string? brand = null,
        [FromQuery] string? search = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? sort = null,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetProductsQuery(page, pageSize, categorySlug, brand, search, minPrice, maxPrice, sort), cancellationToken));

    [HttpGet("by-id/{id:guid}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetProductByIdQuery(id), cancellationToken));

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetProductBySlugQuery(slug), cancellationToken));

    [HttpPost("{slugOrId}/view")]
    public async Task<IActionResult> RecordView(string slugOrId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new RecordProductViewCommand(slugOrId, _currentUser.UserId, GuestToken), cancellationToken);
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:guid}/like")]
    public async Task<IActionResult> ToggleLike(Guid id, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not Guid userId)
            return Unauthorized();
        return Ok(await _mediator.Send(new ToggleProductLikeCommand(id, userId), cancellationToken));
    }

    [HttpGet("{id:guid}/comments")]
    public async Task<IActionResult> GetComments(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetProductCommentsQuery(id, page, pageSize), cancellationToken));

    [Authorize]
    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(
        Guid id,
        [FromBody] AddProductCommentRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not Guid userId)
            return Unauthorized();
        return Ok(await _mediator.Send(
            new AddProductCommentCommand(id, userId, request.Body, request.Rating),
            cancellationToken));
    }
}
