import { apiRequest } from "./client"
import type {
  CreateSupportTicketRequest,
  PagedSupportTickets,
  ReplySupportTicketRequest,
  SupportTicketDetail,
} from "./support-ticket-types"

export const supportTicketsApi = {
  list(page = 1, pageSize = 10) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    return apiRequest<PagedSupportTickets>(
      `/api/support/tickets?${params.toString()}`,
      { auth: true }
    )
  },

  get(ticketId: string) {
    return apiRequest<SupportTicketDetail>(`/api/support/tickets/${ticketId}`, {
      auth: true,
    })
  },

  create(request: CreateSupportTicketRequest) {
    return apiRequest<SupportTicketDetail>("/api/support/tickets", {
      method: "POST",
      auth: true,
      body: JSON.stringify(request),
    })
  },

  reply(ticketId: string, request: ReplySupportTicketRequest) {
    return apiRequest<SupportTicketDetail>(
      `/api/support/tickets/${ticketId}/replies`,
      {
        method: "POST",
        auth: true,
        body: JSON.stringify(request),
      }
    )
  },
}
