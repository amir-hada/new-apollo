using Apollo.Application.Abstractions.Notifications;
using Apollo.Application.Abstractions.Support;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Support;

public sealed class SupportTicketService : ISupportTicketService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public SupportTicketService(
        ApplicationDbContext dbContext,
        INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task<SupportTicketDetailDto> CreateAsync(
        Guid userId,
        CreateSupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var body = request.Message.Trim();
        var ticketId = Guid.NewGuid();
        var ticketNumber = await AllocateNextTicketNumberAsync(cancellationToken);
        var ticket = new SupportTicket
        {
            Id = ticketId,
            Number = ticketNumber,
            UserId = userId,
            Subject = request.Subject.Trim(),
            Message = body,
            Status = SupportTicketStatus.Open,
            Priority = (SupportTicketPriority)request.Priority,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            Messages =
            [
                new SupportTicketMessage
                {
                    Id = Guid.NewGuid(),
                    TicketId = ticketId,
                    SenderUserId = userId,
                    Body = body,
                    IsStaff = false,
                    CreatedAtUtc = now,
                }
            ],
        };

        _dbContext.SupportTickets.Add(ticket);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            userId,
            NotificationTypes.SupportTicketCreated,
            $"تیکت شماره {ticket.Number} با موفقیت ثبت شد.",
            cancellationToken);

        return await GetByIdForUserAsync(userId, ticket.Id, cancellationToken);
    }

    public async Task<PagedResult<SupportTicketListItemDto>> GetForUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _dbContext.SupportTickets
            .AsNoTracking()
            .Where(ticket => ticket.UserId == userId)
            .OrderByDescending(ticket => ticket.UpdatedAtUtc ?? ticket.CreatedAtUtc);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ticket => new SupportTicketListItemDto(
                ticket.Id,
                ticket.Number,
                ticket.Subject,
                (SupportTicketStatusDto)ticket.Status,
                (SupportTicketPriorityDto)ticket.Priority,
                ticket.CreatedAtUtc,
                ticket.UpdatedAtUtc,
                ticket.Messages.Count,
                ticket.Messages
                    .OrderByDescending(message => message.CreatedAtUtc)
                    .Select(message => (DateTime?)message.CreatedAtUtc)
                    .FirstOrDefault(),
                null,
                null,
                null,
                null))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<SupportTicketListItemDto>(items, page, pageSize, totalCount, totalPages);
    }

    public async Task<SupportTicketDetailDto> GetByIdForUserAsync(
        Guid userId,
        Guid ticketId,
        CancellationToken cancellationToken = default)
    {
        var ticket = await LoadTicketQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.Id == ticketId && item.UserId == userId,
                cancellationToken)
            ?? throw new NotFoundException("تیکت یافت نشد.");

        return MapDetail(ticket);
    }

    public async Task<SupportTicketDetailDto> ReplyAsUserAsync(
        Guid userId,
        Guid ticketId,
        ReplySupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _dbContext.SupportTickets
            .FirstOrDefaultAsync(
                item => item.Id == ticketId && item.UserId == userId,
                cancellationToken)
            ?? throw new NotFoundException("تیکت یافت نشد.");

        EnsureTicketAcceptsUserReply(ticket);

        var now = DateTime.UtcNow;
        _dbContext.SupportTicketMessages.Add(new SupportTicketMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            SenderUserId = userId,
            Body = request.Message.Trim(),
            IsStaff = false,
            CreatedAtUtc = now,
        });

        if (ticket.Status is SupportTicketStatus.WaitingOnUser or SupportTicketStatus.Resolved)
        {
            ticket.Status = SupportTicketStatus.InProgress;
        }

        ticket.UpdatedAtUtc = now;
        ticket.ClosedAtUtc = null;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdForUserAsync(userId, ticketId, cancellationToken);
    }

    public async Task<PagedResult<SupportTicketListItemDto>> GetForAdminAsync(
        int page,
        int pageSize,
        SupportTicketStatusDto? status,
        SupportTicketPriorityDto? priority,
        string? search,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.SupportTickets
            .AsNoTracking()
            .Include(ticket => ticket.User)
            .Include(ticket => ticket.AssignedToAdmin)
            .Include(ticket => ticket.Messages)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(ticket => ticket.Status == (SupportTicketStatus)status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(ticket => ticket.Priority == (SupportTicketPriority)priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(ticket =>
                ticket.Number.Contains(term) ||
                ticket.Subject.Contains(term) ||
                (ticket.User.Email != null && ticket.User.Email.Contains(term)) ||
                (ticket.User.PhoneNumber != null && ticket.User.PhoneNumber.Contains(term)) ||
                ticket.User.FirstName.Contains(term) ||
                ticket.User.LastName.Contains(term));
        }

        query = query.OrderByDescending(ticket => ticket.UpdatedAtUtc ?? ticket.CreatedAtUtc);

        var totalCount = await query.CountAsync(cancellationToken);
        var tickets = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = tickets.Select(MapListItem).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<SupportTicketListItemDto>(items, page, pageSize, totalCount, totalPages);
    }

    public async Task<SupportTicketDetailDto> GetByIdForAdminAsync(
        Guid ticketId,
        CancellationToken cancellationToken = default)
    {
        var ticket = await LoadTicketQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == ticketId, cancellationToken)
            ?? throw new NotFoundException("تیکت یافت نشد.");

        return MapDetail(ticket);
    }

    public async Task<SupportTicketDetailDto> ReplyAsAdminAsync(
        Guid adminUserId,
        Guid ticketId,
        ReplySupportTicketRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _dbContext.SupportTickets
            .FirstOrDefaultAsync(item => item.Id == ticketId, cancellationToken)
            ?? throw new NotFoundException("تیکت یافت نشد.");

        if (ticket.Status == SupportTicketStatus.Closed)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["status"] = ["تیکت بسته شده است؛ ابتدا وضعیت را تغییر دهید."],
            });
        }

        var now = DateTime.UtcNow;
        _dbContext.SupportTicketMessages.Add(new SupportTicketMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            SenderUserId = adminUserId,
            Body = request.Message.Trim(),
            IsStaff = true,
            CreatedAtUtc = now,
        });

        ticket.AssignedToAdminId ??= adminUserId;
        ticket.Status = SupportTicketStatus.WaitingOnUser;
        ticket.UpdatedAtUtc = now;
        ticket.ClosedAtUtc = null;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            ticket.UserId,
            NotificationTypes.SupportTicketReply,
            $"پاسخ جدیدی برای تیکت شماره {ticket.Number} ثبت شد.",
            cancellationToken);

        return await GetByIdForAdminAsync(ticketId, cancellationToken);
    }

    public async Task<SupportTicketDetailDto> UpdateStatusAsync(
        Guid adminUserId,
        Guid ticketId,
        UpdateSupportTicketStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _dbContext.SupportTickets
            .FirstOrDefaultAsync(item => item.Id == ticketId, cancellationToken)
            ?? throw new NotFoundException("تیکت یافت نشد.");

        var now = DateTime.UtcNow;
        ticket.Status = (SupportTicketStatus)request.Status;
        ticket.AssignedToAdminId ??= adminUserId;
        ticket.UpdatedAtUtc = now;
        ticket.ClosedAtUtc = request.Status is SupportTicketStatusDto.Closed or SupportTicketStatusDto.Resolved
            ? now
            : null;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            ticket.UserId,
            NotificationTypes.SupportTicketStatus,
            $"وضعیت تیکت شماره {ticket.Number} به «{StatusLabel(request.Status)}» تغییر کرد.",
            cancellationToken);

        return await GetByIdForAdminAsync(ticketId, cancellationToken);
    }

    public async Task<SupportTicketDetailDto> UpdatePriorityAsync(
        Guid adminUserId,
        Guid ticketId,
        UpdateSupportTicketPriorityRequest request,
        CancellationToken cancellationToken = default)
    {
        var ticket = await _dbContext.SupportTickets
            .FirstOrDefaultAsync(item => item.Id == ticketId, cancellationToken)
            ?? throw new NotFoundException("تیکت یافت نشد.");

        ticket.Priority = (SupportTicketPriority)request.Priority;
        ticket.AssignedToAdminId ??= adminUserId;
        ticket.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdForAdminAsync(ticketId, cancellationToken);
    }

    private async Task<string> AllocateNextTicketNumberAsync(CancellationToken cancellationToken)
    {
        // 8-digit random number (10000000–99999999), not sequential / guessable.
        for (var attempt = 0; attempt < 32; attempt++)
        {
            var candidate = Random.Shared.Next(10_000_000, 100_000_000).ToString();
            var exists = await _dbContext.SupportTickets
                .AsNoTracking()
                .AnyAsync(ticket => ticket.Number == candidate, cancellationToken);
            if (!exists)
            {
                return candidate;
            }
        }

        throw new InvalidOperationException("امکان تولید شماره تیکت یکتا وجود نداشت. دوباره تلاش کنید.");
    }

    private IQueryable<SupportTicket> LoadTicketQuery() =>
        _dbContext.SupportTickets
            .Include(ticket => ticket.User)
            .Include(ticket => ticket.AssignedToAdmin)
            .Include(ticket => ticket.Messages)
            .ThenInclude(message => message.Sender);

    private static void EnsureTicketAcceptsUserReply(SupportTicket ticket)
    {
        if (ticket.Status == SupportTicketStatus.Closed)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["status"] = ["این تیکت بسته شده و امکان پاسخ وجود ندارد."],
            });
        }
    }

    private static string StatusLabel(SupportTicketStatusDto status) =>
        status switch
        {
            SupportTicketStatusDto.Open => "باز",
            SupportTicketStatusDto.InProgress => "در حال پیگیری",
            SupportTicketStatusDto.WaitingOnUser => "در انتظار پاسخ شما",
            SupportTicketStatusDto.Resolved => "حل‌شده",
            SupportTicketStatusDto.Closed => "بسته",
            _ => status.ToString(),
        };

    private static string DisplayName(ApplicationUser? user)
    {
        if (user is null) return "—";
        var name = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrWhiteSpace(name) ? (user.UserName ?? user.Email ?? "—") : name;
    }

    private static SupportTicketListItemDto MapListItem(SupportTicket ticket)
    {
        var lastMessage = ticket.Messages
            .OrderByDescending(message => message.CreatedAtUtc)
            .FirstOrDefault();

        return new SupportTicketListItemDto(
            ticket.Id,
            ticket.Number,
            ticket.Subject,
            (SupportTicketStatusDto)ticket.Status,
            (SupportTicketPriorityDto)ticket.Priority,
            ticket.CreatedAtUtc,
            ticket.UpdatedAtUtc,
            ticket.Messages.Count,
            lastMessage?.CreatedAtUtc,
            DisplayName(ticket.User),
            ticket.User.PhoneNumber,
            ticket.User.Email,
            ticket.AssignedToAdmin is null ? null : DisplayName(ticket.AssignedToAdmin));
    }

    private static SupportTicketDetailDto MapDetail(SupportTicket ticket)
    {
        var messages = ticket.Messages
            .OrderBy(message => message.CreatedAtUtc)
            .Select(message => new SupportTicketMessageDto(
                message.Id,
                message.SenderUserId,
                DisplayName(message.Sender),
                message.Body,
                message.IsStaff,
                message.CreatedAtUtc))
            .ToList();

        if (messages.Count == 0 && !string.IsNullOrWhiteSpace(ticket.Message))
        {
            messages.Add(new SupportTicketMessageDto(
                Guid.Empty,
                ticket.UserId,
                DisplayName(ticket.User),
                ticket.Message,
                false,
                ticket.CreatedAtUtc));
        }

        return new SupportTicketDetailDto(
            ticket.Id,
            ticket.Number,
            ticket.Subject,
            (SupportTicketStatusDto)ticket.Status,
            (SupportTicketPriorityDto)ticket.Priority,
            ticket.CreatedAtUtc,
            ticket.UpdatedAtUtc,
            ticket.ClosedAtUtc,
            DisplayName(ticket.User),
            ticket.User.PhoneNumber,
            ticket.User.Email,
            ticket.AssignedToAdmin is null ? null : DisplayName(ticket.AssignedToAdmin),
            messages);
    }
}
