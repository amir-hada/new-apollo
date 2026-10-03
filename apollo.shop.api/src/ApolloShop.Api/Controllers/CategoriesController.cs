using ApolloShop.Application.Features.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator) => _mediator = mediator;

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetCategoryTreeQuery(), cancellationToken));
}
