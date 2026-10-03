using ApolloShop.Application.Features.Blog.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/blog")]
public class BlogController : ControllerBase
{
    private readonly IMediator _mediator;

    public BlogController(IMediator mediator) => _mediator = mediator;

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetBlogPostsQuery(page, pageSize, search), cancellationToken));

    [HttpGet("posts/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetBlogPostBySlugQuery(slug), cancellationToken));

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetBlogCategoriesQuery(), cancellationToken));

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetBlogTagsQuery(), cancellationToken));
}
