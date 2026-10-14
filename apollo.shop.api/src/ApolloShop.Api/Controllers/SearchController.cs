using ApolloShop.Application.Features.Search.DTOs;
using ApolloShop.Application.Features.Search.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly IMediator _mediator;

    public SearchController(IMediator mediator) => _mediator = mediator;

    /// <summary>پیشنهاد سریع برای سرچ نوبار: محصول، برند، دسته.</summary>
    [HttpGet("suggest")]
    public async Task<ActionResult<SearchSuggestDto>> Suggest(
        [FromQuery] string? q = null,
        [FromQuery] int limit = 6,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new SearchSuggestQuery(q, limit), cancellationToken));
}
