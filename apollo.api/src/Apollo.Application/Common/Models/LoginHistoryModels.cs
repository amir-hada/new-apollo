namespace Apollo.Application.Common.Models;

public sealed record LoginHistoryDto(
    Guid Id,
    DateTime LoggedInAtUtc,
    string IpAddress,
    string Device);
