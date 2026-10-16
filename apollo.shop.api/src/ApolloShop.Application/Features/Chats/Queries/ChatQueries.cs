using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Chats.DTOs;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Chats.Queries;

public record SearchChatUsersQuery(string? Search, int Limit = 20) : IRequest<IReadOnlyList<ChatUserSearchDto>>;

public record GetAdminConversationsQuery(string? Search = null) : IRequest<IReadOnlyList<ChatConversationDto>>;

public record GetMyConversationsQuery : IRequest<IReadOnlyList<ChatConversationDto>>;

public record GetConversationMessagesQuery(Guid ConversationId, int Take = 100)
    : IRequest<IReadOnlyList<ChatMessageDto>>;

public record GetAdminUnreadTotalQuery : IRequest<int>;

public class SearchChatUsersQueryHandler : IRequestHandler<SearchChatUsersQuery, IReadOnlyList<ChatUserSearchDto>>
{
    private readonly IApplicationDbContext _db;

    public SearchChatUsersQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<ChatUserSearchDto>> Handle(SearchChatUsersQuery request, CancellationToken cancellationToken)
    {
        var limit = Math.Clamp(request.Limit, 1, 50);
        var query = _db.Users.AsNoTracking().Where(u => u.IsActive);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(s) ||
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(s)) ||
                (u.FirstName + " " + u.LastName).ToLower().Contains(s));
        }

        var users = await query
            .OrderBy(u => u.FirstName).ThenBy(u => u.LastName)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return users.Select(ChatMapper.ToUserSearchDto).ToList();
    }
}

public class GetAdminConversationsQueryHandler
    : IRequestHandler<GetAdminConversationsQuery, IReadOnlyList<ChatConversationDto>>
{
    private readonly IApplicationDbContext _db;

    public GetAdminConversationsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<ChatConversationDto>> Handle(
        GetAdminConversationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.ChatConversations
            .AsNoTracking()
            .Include(c => c.Customer)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(c =>
                c.Customer.FirstName.ToLower().Contains(s) ||
                c.Customer.LastName.ToLower().Contains(s) ||
                c.Customer.Email.ToLower().Contains(s) ||
                (c.Customer.PhoneNumber != null && c.Customer.PhoneNumber.Contains(s)) ||
                (c.LastMessagePreview != null && c.LastMessagePreview.ToLower().Contains(s)));
        }

        var items = await query
            .OrderByDescending(c => c.LastMessageAtUtc ?? c.CreatedAtUtc)
            .Take(200)
            .ToListAsync(cancellationToken);

        return items.Select(c => ChatMapper.ToConversationDto(c, asAdmin: true)).ToList();
    }
}

public class GetMyConversationsQueryHandler
    : IRequestHandler<GetMyConversationsQuery, IReadOnlyList<ChatConversationDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMyConversationsQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ChatConversationDto>> Handle(
        GetMyConversationsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");

        var items = await _db.ChatConversations
            .AsNoTracking()
            .Include(c => c.Customer)
            .Where(c => c.CustomerUserId == userId)
            .OrderByDescending(c => c.LastMessageAtUtc ?? c.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return items.Select(c => ChatMapper.ToConversationDto(c, asAdmin: false)).ToList();
    }
}

public class GetConversationMessagesQueryHandler
    : IRequestHandler<GetConversationMessagesQuery, IReadOnlyList<ChatMessageDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetConversationMessagesQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ChatMessageDto>> Handle(
        GetConversationMessagesQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");
        var isAdmin = _currentUser.IsInRole("Admin");

        var conversation = await _db.ChatConversations
            .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("ChatConversation", request.ConversationId);

        if (!isAdmin && conversation.CustomerUserId != userId)
        {
            throw new NotFoundException("ChatConversation", request.ConversationId);
        }

        var peerLastRead = isAdmin
            ? conversation.CustomerLastReadAtUtc
            : conversation.AdminLastReadAtUtc;

        var take = Math.Clamp(request.Take, 1, 500);
        var messages = await _db.ChatMessages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == request.ConversationId)
            .OrderByDescending(m => m.CreatedAtUtc)
            .Take(take)
            .ToListAsync(cancellationToken);

        messages.Reverse();
        return messages.Select(m => ChatMapper.ToMessageDto(m, userId, peerLastRead)).ToList();
    }
}

public class GetAdminUnreadTotalQueryHandler : IRequestHandler<GetAdminUnreadTotalQuery, int>
{
    private readonly IApplicationDbContext _db;

    public GetAdminUnreadTotalQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<int> Handle(GetAdminUnreadTotalQuery request, CancellationToken cancellationToken) =>
        await _db.ChatConversations.SumAsync(c => (int?)c.UnreadByAdminCount, cancellationToken) ?? 0;
}
