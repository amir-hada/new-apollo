using Apollo.Application.Abstractions.Support;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Queries.GetAdminSupportTickets;

public sealed record GetAdminSupportTicketsQuery(
    int Page = 1,
    int PageSize = 20,
    SupportTicketStatusDto? Status = null,
    SupportTicketPriorityDto? Priority = null,
    string? Search = null) : IRequest<PagedResult<SupportTicketListItemDto>>;

public sealed class GetAdminSupportTicketsQueryValidator
    : AbstractValidator<GetAdminSupportTicketsQuery>
{
    public GetAdminSupportTicketsQueryValidator()
    {
        RuleFor(query => query.Page).GreaterThanOrEqualTo(1);
        RuleFor(query => query.PageSize).InclusiveBetween(1, 100);
        RuleFor(query => query.Status!)
            .IsInEnum()
            .When(query => query.Status.HasValue);
        RuleFor(query => query.Priority!)
            .IsInEnum()
            .When(query => query.Priority.HasValue);
    }
}

public sealed class GetAdminSupportTicketsQueryHandler
    : IRequestHandler<GetAdminSupportTicketsQuery, PagedResult<SupportTicketListItemDto>>
{
    private readonly ISupportTicketService _supportTicketService;

    public GetAdminSupportTicketsQueryHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<PagedResult<SupportTicketListItemDto>> Handle(
        GetAdminSupportTicketsQuery request,
        CancellationToken cancellationToken) =>
        _supportTicketService.GetForAdminAsync(
            request.Page,
            request.PageSize,
            request.Status,
            request.Priority,
            request.Search,
            cancellationToken);
}
