using ApolloShop.Domain.Enums;

namespace ApolloShop.Application.Features.Tickets.DTOs;

public record TicketMessageDto(Guid Id, Guid SenderUserId, string Body, bool IsStaff, DateTime CreatedAtUtc);
public record TicketListItemDto(Guid Id, string Number, string Subject, TicketStatus Status, TicketPriority Priority, DateTime CreatedAtUtc, Guid? AssignedToUserId, string? CategoryName);
public record TicketDetailDto(
    Guid Id, string Number, string Subject, TicketStatus Status, TicketPriority Priority,
    Guid UserId, Guid? AssignedToUserId, Guid? CategoryId, string? CategoryName,
    DateTime CreatedAtUtc, IReadOnlyList<TicketMessageDto> Messages);

public record CreateTicketRequest(string Subject, string Message, Guid? CategoryId, TicketPriority Priority);
public record ReplyTicketRequest(string Message);
public record AssignTicketRequest(Guid AssignedToUserId);
public record UpdateTicketStatusRequest(TicketStatus Status);
public record UpdateTicketPriorityRequest(TicketPriority Priority);
