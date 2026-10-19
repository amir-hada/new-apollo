using Apollo.Application.Abstractions.Support;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Support.Queries.GetMySupportTickets;

public sealed record GetMySupportTicketsQuery(
    Guid UserId,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<SupportTicketListItemDto>>;

public sealed class GetMySupportTicketsQueryValidator : AbstractValidator<GetMySupportTicketsQuery>
{
    public GetMySupportTicketsQueryValidator()
    {
        RuleFor(query => query.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(query => query.Page)
            .GreaterThanOrEqualTo(1).WithMessage("شماره صفحه نامعتبر است.");

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, 50).WithMessage("اندازه صفحه باید بین ۱ تا ۵۰ باشد.");
    }
}

public sealed class GetMySupportTicketsQueryHandler
    : IRequestHandler<GetMySupportTicketsQuery, PagedResult<SupportTicketListItemDto>>
{
    private readonly ISupportTicketService _supportTicketService;

    public GetMySupportTicketsQueryHandler(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    public Task<PagedResult<SupportTicketListItemDto>> Handle(
        GetMySupportTicketsQuery request,
        CancellationToken cancellationToken) =>
        _supportTicketService.GetForUserAsync(
            request.UserId,
            request.Page,
            request.PageSize,
            cancellationToken);
}
