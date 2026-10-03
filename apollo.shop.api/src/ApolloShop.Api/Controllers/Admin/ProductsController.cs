using ApolloShop.Application.Features.Products.Commands;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/products")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? categorySlug = null,
        [FromQuery] string? brand = null,
        [FromQuery] string? search = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? sort = null,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetProductsQuery(page, pageSize, categorySlug, brand, search, minPrice, maxPrice, sort, Admin: true), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetProductByIdQuery(id), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateProductCommand(request), cancellationToken));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateProductCommand(id, request), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteProductCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:guid}/reports")]
    public async Task<IActionResult> GetReports(
        Guid id,
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetProductReportQuery(id, days), cancellationToken));
}
