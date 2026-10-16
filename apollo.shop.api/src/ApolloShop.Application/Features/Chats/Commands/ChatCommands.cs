using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Chats.DTOs;
using ApolloShop.Domain.Entities.Support;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Chats.Commands;

public record StartOrGetConversationCommand(Guid CustomerUserId, string? InitialMessage)
    : IRequest<ChatConversationDto>;

public record SendChatMessageCommand(Guid ConversationId, string Body) : IRequest<ChatMessageDto>;

public record MarkConversationReadCommand(Guid ConversationId) : IRequest;

public class StartOrGetConversationCommandHandler
    : IRequestHandler<StartOrGetConversationCommand, ChatConversationDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;
    private readonly IChatRealtimePublisher _realtime;

    public StartOrGetConversationCommandHandler(
        IApplicationDbContext db,
        ICurrentUser currentUser,
        IDateTimeProvider clock,
        IChatRealtimePublisher realtime)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
        _realtime = realtime;
    }

    public async Task<ChatConversationDto> Handle(
        StartOrGetConversationCommand request,
        CancellationToken cancellationToken)
    {
        var adminId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");

        var customer = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == request.CustomerUserId && u.IsActive, cancellationToken)
            ?? throw new NotFoundException("User", request.CustomerUserId);

        var conversation = await _db.ChatConversations
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.CustomerUserId == customer.Id, cancellationToken);

        if (conversation is null)
        {
            conversation = new ChatConversation
            {
                Id = Guid.NewGuid(),
                CustomerUserId = customer.Id,
                Customer = customer,
            };
            _db.ChatConversations.Add(conversation);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var initial = request.InitialMessage?.Trim();
        if (!string.IsNullOrEmpty(initial))
        {
            await SendInternalAsync(conversation.Id, adminId, initial, isAdminSender: true, cancellationToken);
            conversation = await _db.ChatConversations
                .AsNoTracking()
                .Include(c => c.Customer)
                .FirstAsync(c => c.Id == conversation.Id, cancellationToken);
        }

        return ChatMapper.ToConversationDto(conversation, asAdmin: true);
    }

    private async Task SendInternalAsync(
        Guid conversationId,
        Guid senderUserId,
        string body,
        bool isAdminSender,
        CancellationToken cancellationToken)
    {
        var conversation = await _db.ChatConversations
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken)
            ?? throw new NotFoundException("ChatConversation", conversationId);

        var now = _clock.UtcNow;
        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            SenderUserId = senderUserId,
            Body = body,
            CreatedAtUtc = now,
        };

        conversation.LastMessagePreview = ChatMapper.Preview(body);
        conversation.LastMessageAtUtc = now;
        if (isAdminSender)
            conversation.UnreadByCustomerCount += 1;
        else
            conversation.UnreadByAdminCount += 1;

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);

        var sender = await _db.Users.AsNoTracking()
            .FirstAsync(u => u.Id == senderUserId, cancellationToken);
        message.Sender = sender;

        await _realtime.PublishMessageAsync(
            ChatMapper.ToMessageDto(message, Guid.Empty, null) with { IsMine = false },
            conversation.CustomerUserId,
            cancellationToken);
        await _realtime.PublishConversationUpdatedAsync(
            conversation.Id,
            conversation.CustomerUserId,
            cancellationToken);
    }
}

public class SendChatMessageCommandHandler : IRequestHandler<SendChatMessageCommand, ChatMessageDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;
    private readonly IChatRealtimePublisher _realtime;

    public SendChatMessageCommandHandler(
        IApplicationDbContext db,
        ICurrentUser currentUser,
        IDateTimeProvider clock,
        IChatRealtimePublisher realtime)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
        _realtime = realtime;
    }

    public async Task<ChatMessageDto> Handle(SendChatMessageCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");

        var body = request.Body?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(body))
            throw new ValidationException("Body", "متن پیام نمی‌تواند خالی باشد.");

        if (body.Length > 4000)
            throw new ValidationException("Body", "پیام بیش از حد طولانی است.");

        var isAdmin = _currentUser.IsInRole("Admin");
        var conversation = await _db.ChatConversations
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("ChatConversation", request.ConversationId);

        if (!isAdmin && conversation.CustomerUserId != userId)
            throw new NotFoundException("ChatConversation", request.ConversationId);

        var now = _clock.UtcNow;
        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            SenderUserId = userId,
            Body = body,
            CreatedAtUtc = now,
        };

        conversation.LastMessagePreview = ChatMapper.Preview(body);
        conversation.LastMessageAtUtc = now;
        if (isAdmin)
            conversation.UnreadByCustomerCount += 1;
        else
            conversation.UnreadByAdminCount += 1;

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);

        var sender = await _db.Users.AsNoTracking().FirstAsync(u => u.Id == userId, cancellationToken);
        message.Sender = sender;

        var peerLastRead = isAdmin
            ? conversation.CustomerLastReadAtUtc
            : conversation.AdminLastReadAtUtc;
        var dto = ChatMapper.ToMessageDto(message, userId, peerLastRead);

        await _realtime.PublishMessageAsync(
            ChatMapper.ToMessageDto(message, Guid.Empty, null) with { IsMine = false },
            conversation.CustomerUserId,
            cancellationToken);
        await _realtime.PublishConversationUpdatedAsync(
            conversation.Id,
            conversation.CustomerUserId,
            cancellationToken);

        return dto;
    }
}

public class MarkConversationReadCommandHandler : IRequestHandler<MarkConversationReadCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;
    private readonly IChatRealtimePublisher _realtime;

    public MarkConversationReadCommandHandler(
        IApplicationDbContext db,
        ICurrentUser currentUser,
        IDateTimeProvider clock,
        IChatRealtimePublisher realtime)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
        _realtime = realtime;
    }

    public async Task Handle(MarkConversationReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");
        var isAdmin = _currentUser.IsInRole("Admin");

        var conversation = await _db.ChatConversations
            .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("ChatConversation", request.ConversationId);

        if (!isAdmin && conversation.CustomerUserId != userId)
            throw new NotFoundException("ChatConversation", request.ConversationId);

        var now = _clock.UtcNow;
        var changed = false;

        if (isAdmin)
        {
            if (conversation.UnreadByAdminCount != 0)
            {
                conversation.UnreadByAdminCount = 0;
                changed = true;
            }
            if (conversation.AdminLastReadAtUtc != now)
            {
                conversation.AdminLastReadAtUtc = now;
                changed = true;
            }
        }
        else
        {
            if (conversation.UnreadByCustomerCount != 0)
            {
                conversation.UnreadByCustomerCount = 0;
                changed = true;
            }
            if (conversation.CustomerLastReadAtUtc != now)
            {
                conversation.CustomerLastReadAtUtc = now;
                changed = true;
            }
        }

        if (!changed) return;

        await _db.SaveChangesAsync(cancellationToken);
        await _realtime.PublishConversationUpdatedAsync(
            conversation.Id,
            conversation.CustomerUserId,
            cancellationToken);
        await _realtime.PublishMessagesReadAsync(
            new ChatMessagesReadDto(conversation.Id, userId, now, isAdmin),
            conversation.CustomerUserId,
            cancellationToken);
    }
}
