using Apollo.Infrastructure.Identity;

namespace Apollo.Infrastructure.Persistence.Entities;

public enum SupportTicketStatus
{
    Open = 0,
    InProgress = 1,
    WaitingOnUser = 2,
    Resolved = 3,
    Closed = 4,
}

public enum SupportTicketPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3,
}

public sealed class SupportTicket
{
    public Guid Id { get; set; }

    public string Number { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public string Subject { get; set; } = string.Empty;

    /// <summary>Legacy first-message body kept for older rows; prefer <see cref="Messages"/>.</summary>
    public string Message { get; set; } = string.Empty;

    public SupportTicketStatus Status { get; set; } = SupportTicketStatus.Open;

    public SupportTicketPriority Priority { get; set; } = SupportTicketPriority.Medium;

    public Guid? AssignedToAdminId { get; set; }

    public ApplicationUser? AssignedToAdmin { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public DateTime? ClosedAtUtc { get; set; }

    public ICollection<SupportTicketMessage> Messages { get; set; } = new List<SupportTicketMessage>();
}

public sealed class SupportTicketMessage
{
    public Guid Id { get; set; }

    public Guid TicketId { get; set; }

    public SupportTicket Ticket { get; set; } = null!;

    public Guid SenderUserId { get; set; }

    public ApplicationUser Sender { get; set; } = null!;

    public string Body { get; set; } = string.Empty;

    public bool IsStaff { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
