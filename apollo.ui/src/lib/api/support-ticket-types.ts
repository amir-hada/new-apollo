export type SupportTicketStatus =
  | "Open"
  | "InProgress"
  | "WaitingOnUser"
  | "Resolved"
  | "Closed"
  | 0
  | 1
  | 2
  | 3
  | 4

export type SupportTicketPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Urgent"
  | 0
  | 1
  | 2
  | 3

export type CreateSupportTicketRequest = {
  subject: string
  message: string
  priority: number
}

export type ReplySupportTicketRequest = {
  message: string
}

export type SupportTicketMessage = {
  id: string
  senderUserId: string
  senderName: string
  body: string
  isStaff: boolean
  createdAtUtc: string
}

export type SupportTicketListItem = {
  id: string
  number: string
  subject: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  createdAtUtc: string
  updatedAtUtc?: string | null
  messageCount?: number
  lastMessageAtUtc?: string | null
}

export type SupportTicketDetail = {
  id: string
  number: string
  subject: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  createdAtUtc: string
  updatedAtUtc: string | null
  closedAtUtc: string | null
  userDisplayName: string | null
  userPhoneNumber: string | null
  userEmail: string | null
  assignedToAdminName: string | null
  messages: SupportTicketMessage[]
}

export type PagedSupportTickets = {
  items: SupportTicketListItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export const supportTicketStatusLabel: Record<number, string> = {
  0: "باز",
  1: "در حال پیگیری",
  2: "در انتظار پاسخ شما",
  3: "حل‌شده",
  4: "بسته",
}

export const supportTicketPriorityLabel: Record<number, string> = {
  0: "کم",
  1: "متوسط",
  2: "بالا",
  3: "فوری",
}

export function toTicketStatusNumber(status: SupportTicketStatus): number {
  if (typeof status === "number") return status
  const map: Record<string, number> = {
    Open: 0,
    InProgress: 1,
    WaitingOnUser: 2,
    Resolved: 3,
    Closed: 4,
  }
  return map[status] ?? 0
}

export function toTicketPriorityNumber(priority: SupportTicketPriority): number {
  if (typeof priority === "number") return priority
  const map: Record<string, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
    Urgent: 3,
  }
  return map[priority] ?? 1
}

export function formatTicketDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}
