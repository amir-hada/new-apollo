using Apollo.Application.Common.Models;

namespace Apollo.Application.Abstractions.Support;

public enum SupportTicketStatusDto
{
    Open = 0,
    InProgress = 1,
    WaitingOnUser = 2,
    Resolved = 3,
    Closed = 4,
}

public enum SupportTicketPriorityDto
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3,
}

public sealed record CreateSupportTicketRequest(
    string Subject,
    string Message,
    SupportTicketPriorityDto Priority);

public sealed record ReplySupportTicketRequest(string Message);

public sealed record UpdateSupportTicketStatusRequest(SupportTicketStatusDto Status);

public sealed record UpdateSupportTicketPriorityRequest(SupportTicketPriorityDto Priority);

public sealed record SupportTicketMessageDto(
    Guid Id,
    Guid SenderUserId,
    string SenderName,
    string Body,
    bool IsStaff,
    DateTime CreatedAtUtc);

public sealed record SupportTicketListItemDto(
    Guid Id,
    string Number,
    string Subject,
    SupportTicketStatusDto Status,
    SupportTicketPriorityDto Priority,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    int MessageCount,
    DateTime? LastMessageAtUtc,
    string? UserDisplayName = null,
    string? UserPhoneNumber = null,
    string? UserEmail = null,
    string? AssignedToAdminName = null);

public sealed record SupportTicketDetailDto(
    Guid Id,
    string Number,
    string Subject,
    SupportTicketStatusDto Status,
    SupportTicketPriorityDto Priority,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? ClosedAtUtc,
    string? UserDisplayName,
    string? UserPhoneNumber,
    string? UserEmail,
    string? AssignedToAdminName,
    IReadOnlyList<SupportTicketMessageDto> Messages);

public interface ISupportTicketService
{
    Task<SupportTicketDetailDto> CreateAsync(
        Guid userId,
        CreateSupportTicketRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResult<SupportTicketListItemDto>> GetForUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<SupportTicketDetailDto> GetByIdForUserAsync(
        Guid userId,
        Guid ticketId,
        CancellationToken cancellationToken = default);

    Task<SupportTicketDetailDto> ReplyAsUserAsync(
        Guid userId,
        Guid ticketId,
        ReplySupportTicketRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResult<SupportTicketListItemDto>> GetForAdminAsync(
        int page,
        int pageSize,
        SupportTicketStatusDto? status,
        SupportTicketPriorityDto? priority,
        string? search,
        CancellationToken cancellationToken = default);

    Task<SupportTicketDetailDto> GetByIdForAdminAsync(
        Guid ticketId,
        CancellationToken cancellationToken = default);

    Task<SupportTicketDetailDto> ReplyAsAdminAsync(
        Guid adminUserId,
        Guid ticketId,
        ReplySupportTicketRequest request,
        CancellationToken cancellationToken = default);

    Task<SupportTicketDetailDto> UpdateStatusAsync(
        Guid adminUserId,
        Guid ticketId,
        UpdateSupportTicketStatusRequest request,
        CancellationToken cancellationToken = default);

    Task<SupportTicketDetailDto> UpdatePriorityAsync(
        Guid adminUserId,
        Guid ticketId,
        UpdateSupportTicketPriorityRequest request,
        CancellationToken cancellationToken = default);
}
