using ApolloShop.Application.Abstractions;
using ApolloShop.Application.Common.Models;
using ApolloShop.Application.Features.Orders.DTOs;
using ApolloShop.Domain.Enums;
using ApolloShop.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Application.Features.Orders.Queries;

public record GetMyOrdersQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResult<OrderListItemDto>>;
public record GetMyOrderByIdQuery(Guid Id) : IRequest<OrderDetailDto>;
public record GetOrdersQuery(int Page = 1, int PageSize = 20, string? Search = null, OrderStatus? Status = null) : IRequest<PagedResult<OrderListItemDto>>;
public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDetailDto>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, PagedResult<OrderListItemDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMyOrdersQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<OrderListItemDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _db.Orders.AsNoTracking().Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAtUtc);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(o => new OrderListItemDto(o.Id, o.OrderNumber, o.Status, o.GrandTotal, o.CreatedAtUtc, null))
            .ToListAsync(cancellationToken);

        return PagedResult<OrderListItemDto>.Create(items, page, pageSize, total);
    }
}

public class GetMyOrderByIdQueryHandler : IRequestHandler<GetMyOrderByIdQuery, OrderDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public GetMyOrderByIdQueryHandler(IApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<OrderDetailDto> Handle(GetMyOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new ApolloShop.Domain.Exceptions.ValidationException("User", "Not authenticated.");
        var order = await _db.Orders.AsNoTracking().Include(o => o.Items).Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Order", request.Id);

        return OrderMapper.ToDetail(order);
    }
}

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, PagedResult<OrderListItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetOrdersQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<OrderListItemDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _db.Orders.AsNoTracking().Include(o => o.User).AsQueryable();
        if (request.Status is not null)
        {
            query = query.Where(o => o.Status == request.Status);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(s) || o.User.Email.ToLower().Contains(s));
        }

        query = query.OrderByDescending(o => o.CreatedAtUtc);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(o => new OrderListItemDto(o.Id, o.OrderNumber, o.Status, o.GrandTotal, o.CreatedAtUtc, o.User.Email))
            .ToListAsync(cancellationToken);

        return PagedResult<OrderListItemDto>.Create(items, page, pageSize, total);
    }
}

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetOrderByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<OrderDetailDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _db.Orders.AsNoTracking().Include(o => o.Items).Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Order", request.Id);

        return OrderMapper.ToDetail(order);
    }
}
