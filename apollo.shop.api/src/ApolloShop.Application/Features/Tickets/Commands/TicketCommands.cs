using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Features.Tickets.DTOs;
using ApolloShop.Application.Features.Tickets.Queries;
using ApolloShop.Domain.Entities.Support;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tickets.Commands;

public record CreateTicketCommand(CreateTicketRequest Request) : IRequest<TicketDetailDto>;
public record ReplyTicketCommand(Guid TicketId, string Message) : IRequest<TicketDetailDto>;
public record AssignTicketCommand(Guid TicketId, Guid AssignedToUserId) : IRequest;
public record UpdateTicketStatusCommand(Guid TicketId, TicketStatus Status) : IRequest;
public record UpdateTicketPriorityCommand(Guid TicketId, TicketPriority Priority) : IRequest;
public record AdminReplyCommand(Guid TicketId, string Message) : IRequest<TicketDetailDto>;

public class CreateTicketCommandHandler : IRequestHandler<CreateTicketCommand, TicketDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;

    public CreateTicketCommandHandler(IApplicationDbContext db, ICurrentUser currentUser, IDateTimeProvider clock)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<TicketDetailDto> Handle(CreateTicketCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            Number = $"TKT-{_clock.UtcNow:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}",
            UserId = userId,
            Subject = request.Request.Subject.Trim(),
            Status = TicketStatus.Open,
            Priority = request.Request.Priority,
            CategoryId = request.Request.CategoryId,
            CreatedAtUtc = _clock.UtcNow,
            Messages =
            [
                new TicketMessage
                {
                    Id = Guid.NewGuid(),
                    SenderUserId = userId,
                    Body = request.Request.Message.Trim(),
                    IsStaff = false,
                    CreatedAtUtc = _clock.UtcNow
                }
            ]
        };

        foreach (var message in ticket.Messages)
        {
            message.TicketId = ticket.Id;
        }

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync(cancellationToken);

        var loaded = await _db.Tickets.AsNoTracking().Include(t => t.Category).Include(t => t.Messages)
            .FirstAsync(t => t.Id == ticket.Id, cancellationToken);
        return TicketMapper.ToDetail(loaded);
    }
}

public class ReplyTicketCommandHandler : IRequestHandler<ReplyTicketCommand, TicketDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;

    public ReplyTicketCommandHandler(IApplicationDbContext db, ICurrentUser currentUser, IDateTimeProvider clock)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<TicketDetailDto> Handle(ReplyTicketCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var ticket = await _db.Tickets.Include(t => t.Messages).Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == request.TicketId && t.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.TicketId);

        ticket.Messages.Add(new TicketMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            SenderUserId = userId,
            Body = request.Message.Trim(),
            IsStaff = false,
            CreatedAtUtc = _clock.UtcNow
        });

        if (ticket.Status == TicketStatus.WaitingOnCustomer)
        {
            ticket.Status = TicketStatus.InProgress;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return TicketMapper.ToDetail(ticket);
    }
}

public class AssignTicketCommandHandler : IRequestHandler<AssignTicketCommand>
{
    private readonly IApplicationDbContext _db;

    public AssignTicketCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(AssignTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.TicketId);

        var assignee = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToUserId, cancellationToken)
            ?? throw new NotFoundException("User", request.AssignedToUserId);

        ticket.AssignedToUserId = assignee.Id;
        if (ticket.Status == TicketStatus.Open)
        {
            ticket.Status = TicketStatus.InProgress;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class UpdateTicketStatusCommandHandler : IRequestHandler<UpdateTicketStatusCommand>
{
    private readonly IApplicationDbContext _db;

    public UpdateTicketStatusCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(UpdateTicketStatusCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.TicketId);

        ticket.Status = request.Status;
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class UpdateTicketPriorityCommandHandler : IRequestHandler<UpdateTicketPriorityCommand>
{
    private readonly IApplicationDbContext _db;

    public UpdateTicketPriorityCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(UpdateTicketPriorityCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.TicketId);

        ticket.Priority = request.Priority;
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class AdminReplyCommandHandler : IRequestHandler<AdminReplyCommand, TicketDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeProvider _clock;

    public AdminReplyCommandHandler(IApplicationDbContext db, ICurrentUser currentUser, IDateTimeProvider clock)
    {
        _db = db;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<TicketDetailDto> Handle(AdminReplyCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var ticket = await _db.Tickets.Include(t => t.Messages).Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == request.TicketId, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.TicketId);

        ticket.Messages.Add(new TicketMessage
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            SenderUserId = userId,
            Body = request.Message.Trim(),
            IsStaff = true,
            CreatedAtUtc = _clock.UtcNow
        });

        ticket.Status = TicketStatus.WaitingOnCustomer;
        ticket.AssignedToUserId ??= userId;
        await _db.SaveChangesAsync(cancellationToken);
        return TicketMapper.ToDetail(ticket);
    }
}
