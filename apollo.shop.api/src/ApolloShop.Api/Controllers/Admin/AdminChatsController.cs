using ApolloShop.Application.Features.Chats.Commands;
using ApolloShop.Application.Features.Chats.DTOs;
using ApolloShop.Application.Features.Chats.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/chats")]
public class AdminChatsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminChatsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers(
        [FromQuery] string? search = null,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new SearchChatUsersQuery(search, limit), cancellationToken));

    [HttpGet("conversations")]
    public async Task<IActionResult> ListConversations(
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetAdminConversationsQuery(search), cancellationToken));

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount(CancellationToken cancellationToken = default) =>
        Ok(new { count = await _mediator.Send(new GetAdminUnreadTotalQuery(), cancellationToken) });

    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid id,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetConversationMessagesQuery(id, take), cancellationToken));

    [HttpPost("conversations")]
    public async Task<IActionResult> Start(
        [FromBody] StartChatRequest request,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(
            new StartOrGetConversationCommand(request.CustomerUserId, request.InitialMessage),
            cancellationToken));

    [HttpPost("conversations/{id:guid}/messages")]
    public async Task<IActionResult> Send(
        Guid id,
        [FromBody] SendChatMessageRequest request,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new SendChatMessageCommand(id, request.Body), cancellationToken));

    [HttpPost("conversations/{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken = default)
    {
        await _mediator.Send(new MarkConversationReadCommand(id), cancellationToken);
        return NoContent();
    }
}
