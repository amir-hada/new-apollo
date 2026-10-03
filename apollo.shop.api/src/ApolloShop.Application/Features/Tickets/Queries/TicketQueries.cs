using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Common.Models;
using ApolloShop.Application.Features.Tickets.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Tickets.Queries;

public record GetMyTicketsQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResult<TicketListItemDto>>;
public record GetMyTicketByIdQuery(Guid Id) : IRequest<TicketDetailDto>;
public record GetTicketsQuery(int Page = 1, int PageSize = 20, TicketStatus? Status = null, string? Search = null) : IRequest<PagedResult<TicketListItemDto>>;
public record GetTicketByIdQuery(Guid Id) : IRequest<TicketDetailDto>;

internal static class TicketMapper
{
    public static TicketDetailDto ToDetail(ApolloShop.Domain.Entities.Support.Ticket t) =>
        new(t.Id, t.Number, t.Subject, t.Status, t.Priority, t.UserId, t.AssignedToUserId, t.CategoryId,
            t.Category?.Name, t.CreatedAtUtc,
            t.Messages.OrderBy(m => m.CreatedAtUtc)
                .Select(m => new TicketMessageDto(m.Id, m.SenderUserId, m.Body, m.IsStaff, m.CreatedAtUtc)).ToList());

    public static IQueryable<TicketListItemDto> Project(IQueryable<ApolloShop.Domain.Entities.Support.Ticket> query) =>
        query.Select(t => new TicketListItemDto(
            t.Id, t.Number, t.Subject, t.Status, t.Priority, t.CreatedAtUtc, t.AssignedToUserId,
            t.Category != null ? t.Category.Name : null));
}

public class GetMyTicketsQueryHandler : IRequestHandler<GetMyTicketsQuery, PagedResult<TicketListItemDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMyTicketsQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<TicketListItemDto>> Handle(GetMyTicketsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _db.Tickets.AsNoTracking().Include(t => t.Category).Where(t => t.UserId == userId).OrderByDescending(t => t.CreatedAtUtc);
        var total = await query.CountAsync(cancellationToken);
        var items = await TicketMapper.Project(query).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return PagedResult<TicketListItemDto>.Create(items, page, pageSize, total);
    }
}

public class GetMyTicketByIdQueryHandler : IRequestHandler<GetMyTicketByIdQuery, TicketDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMyTicketByIdQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<TicketDetailDto> Handle(GetMyTicketByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var ticket = await _db.Tickets.AsNoTracking().Include(t => t.Category).Include(t => t.Messages)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.Id);
        return TicketMapper.ToDetail(ticket);
    }
}

public class GetTicketsQueryHandler : IRequestHandler<GetTicketsQuery, PagedResult<TicketListItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetTicketsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<TicketListItemDto>> Handle(GetTicketsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = _db.Tickets.AsNoTracking().Include(t => t.Category).AsQueryable();
        if (request.Status is not null)
        {
            query = query.Where(t => t.Status == request.Status);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(t => t.Number.ToLower().Contains(s) || t.Subject.ToLower().Contains(s));
        }

        query = query.OrderByDescending(t => t.CreatedAtUtc);
        var total = await query.CountAsync(cancellationToken);
        var items = await TicketMapper.Project(query).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return PagedResult<TicketListItemDto>.Create(items, page, pageSize, total);
    }
}

public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, TicketDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetTicketByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<TicketDetailDto> Handle(GetTicketByIdQuery request, CancellationToken cancellationToken)
    {
        var ticket = await _db.Tickets.AsNoTracking().Include(t => t.Category).Include(t => t.Messages)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Ticket", request.Id);
        return TicketMapper.ToDetail(ticket);
    }
}
