namespace Apollo.Application.Common.Models;

public sealed record NotificationDto(
    Guid Id,
    string Type,
    string Message,
    bool IsRead,
    DateTime CreatedAtUtc);
