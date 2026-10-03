using ApolloShop.Application.Features.Blog.Commands;
using ApolloShop.Application.Features.Blog.DTOs;
using ApolloShop.Application.Features.Blog.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/blog")]
public class BlogController : ControllerBase
{
    private readonly IMediator _mediator;

    public BlogController(IMediator mediator) => _mediator = mediator;

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetBlogPostsQuery(page, pageSize, search, Admin: true), cancellationToken));

    [HttpGet("posts/{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetBlogPostByIdQuery(id), cancellationToken));

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] UpsertBlogPostRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateBlogPostCommand(request), cancellationToken));

    [HttpPut("posts/{id:guid}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpsertBlogPostRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateBlogPostCommand(id, request), cancellationToken));

    [HttpDelete("posts/{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBlogPostCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpPost("posts/{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new PublishBlogPostCommand(id), cancellationToken));

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetBlogCategoriesQuery(), cancellationToken));

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] UpsertBlogCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateBlogCategoryCommand(request), cancellationToken));

    [HttpPut("categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpsertBlogCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateBlogCategoryCommand(id, request), cancellationToken));

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBlogCategoryCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpGet("tags")]
    public async Task<IActionResult> GetTags(CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new GetBlogTagsQuery(), cancellationToken));

    [HttpPost("tags")]
    public async Task<IActionResult> CreateTag([FromBody] UpsertBlogTagRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateBlogTagCommand(request), cancellationToken));

    [HttpPut("tags/{id:guid}")]
    public async Task<IActionResult> UpdateTag(Guid id, [FromBody] UpsertBlogTagRequest request, CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new UpdateBlogTagCommand(id, request), cancellationToken));

    [HttpDelete("tags/{id:guid}")]
    public async Task<IActionResult> DeleteTag(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBlogTagCommand(id), cancellationToken);
        return NoContent();
    }
}
