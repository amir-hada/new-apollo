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
  messageCount: number
  lastMessageAtUtc?: string | null
  userDisplayName?: string | null
  userPhoneNumber?: string | null
  userEmail?: string | null
  assignedToAdminName?: string | null
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

export const supportTicketStatusOptions = [
  { value: 0, label: "باز" },
  { value: 1, label: "در حال پیگیری" },
  { value: 2, label: "در انتظار پاسخ کاربر" },
  { value: 3, label: "حل‌شده" },
  { value: 4, label: "بسته" },
] as const

export const supportTicketPriorityOptions = [
  { value: 0, label: "کم" },
  { value: 1, label: "متوسط" },
  { value: 2, label: "بالا" },
  { value: 3, label: "فوری" },
] as const

export const supportTicketStatusLabel: Record<number, string> = Object.fromEntries(
  supportTicketStatusOptions.map((item) => [item.value, item.label])
)

export const supportTicketPriorityLabel: Record<number, string> = Object.fromEntries(
  supportTicketPriorityOptions.map((item) => [item.value, item.label])
)

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
