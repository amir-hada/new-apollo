using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Chats.DTOs;
using ApolloShop.Domain.Entities.Identity;
using ApolloShop.Domain.Entities.Support;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Chats.Commands;

public record EnsureMySupportConversationCommand : IRequest<ChatConversationDto>;

public class EnsureMySupportConversationCommandHandler
    : IRequestHandler<EnsureMySupportConversationCommand, ChatConversationDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public EnsureMySupportConversationCommandHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ChatConversationDto> Handle(
        EnsureMySupportConversationCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId
            ?? throw new ValidationException("User", "وارد حساب کاربری نشده‌اید.");

        var conversation = await _db.ChatConversations
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.CustomerUserId == userId, cancellationToken);

        if (conversation is null)
        {
            var customer = await _db.Users.FirstAsync(u => u.Id == userId, cancellationToken);
            conversation = new ChatConversation
            {
                Id = Guid.NewGuid(),
                CustomerUserId = userId,
                Customer = customer,
            };
            _db.ChatConversations.Add(conversation);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var (peerName, peerAvatar) = await ResolveSupportPeerAsync(conversation.Id, userId, cancellationToken);
        return ChatMapper.ToConversationDto(conversation, asAdmin: false, peerName, peerAvatar);
    }

    internal static async Task<(string FullName, string? AvatarUrl)> ResolveSupportPeerAsync(
        IApplicationDbContext db,
        Guid conversationId,
        Guid customerUserId,
        CancellationToken cancellationToken)
    {
        var lastStaff = await db.ChatMessages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId && m.SenderUserId != customerUserId)
            .OrderByDescending(m => m.CreatedAtUtc)
            .Select(m => m.Sender)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastStaff is not null)
        {
            var name = ChatMapper.FullName(lastStaff);
            if (!string.IsNullOrWhiteSpace(name))
                return (name, lastStaff.AvatarUrl);
        }

        var admin = await db.Users
            .AsNoTracking()
            .Where(u => u.IsActive && u.UserRoles.Any(ur => ur.RoleId == WellKnownRoles.AdminId))
            .OrderBy(u => u.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (admin is not null)
        {
            var name = ChatMapper.FullName(admin);
            if (!string.IsNullOrWhiteSpace(name))
                return (name, admin.AvatarUrl);
        }

        var shop = await db.ShopSettings.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
        var shopTitle = string.IsNullOrWhiteSpace(shop?.ShopTitle) ? "فروشگاه" : shop!.ShopTitle.Trim();
        return ($"پشتیبانی {shopTitle}", shop?.LogoUrl);
    }

    private Task<(string FullName, string? AvatarUrl)> ResolveSupportPeerAsync(
        Guid conversationId,
        Guid customerUserId,
        CancellationToken cancellationToken) =>
        ResolveSupportPeerAsync(_db, conversationId, customerUserId, cancellationToken);
}
