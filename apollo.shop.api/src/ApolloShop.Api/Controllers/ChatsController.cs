using ApolloShop.Application.Features.Chats.Commands;
using ApolloShop.Application.Features.Chats.DTOs;
using ApolloShop.Application.Features.Chats.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/chats")]
public class ChatsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChatsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("conversations")]
    public async Task<IActionResult> ListMine(CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetMyConversationsQuery(), cancellationToken));

    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid id,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new GetConversationMessagesQuery(id, take), cancellationToken));

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

    /// <summary>Customer opens (or creates) their single support thread with the shop.</summary>
    [HttpPost("conversations/support")]
    public async Task<IActionResult> OpenSupport(CancellationToken cancellationToken = default) =>
        Ok(await _mediator.Send(new EnsureMySupportConversationCommand(), cancellationToken));
}
