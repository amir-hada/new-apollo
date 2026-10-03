import { apiRequest } from "@/lib/api/client"
import type {
  AppNotification,
  PagedNotifications,
} from "@/lib/api/notifications-types"

type RawNotification = {
  id?: string
  Id?: string
  type?: string
  Type?: string
  message?: string
  Message?: string
  isRead?: boolean
  IsRead?: boolean
  createdAtUtc?: string
  CreatedAtUtc?: string
}

type RawPagedNotifications = {
  items?: RawNotification[]
  Items?: RawNotification[]
  page?: number
  Page?: number
  pageSize?: number
  PageSize?: number
  totalCount?: number
  TotalCount?: number
  totalPages?: number
  TotalPages?: number
}

function normalizeNotification(raw: RawNotification): AppNotification {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    type: String(raw.type ?? raw.Type ?? ""),
    message: String(raw.message ?? raw.Message ?? ""),
    isRead: Boolean(raw.isRead ?? raw.IsRead ?? false),
    createdAtUtc: String(raw.createdAtUtc ?? raw.CreatedAtUtc ?? ""),
  }
}

function normalizePagedResult(
  payload: RawPagedNotifications | RawNotification[],
  page: number,
  pageSize: number
): PagedNotifications {
  if (Array.isArray(payload)) {
    const items = payload.map(normalizeNotification)
    return {
      items,
      page,
      pageSize,
      totalCount: items.length,
      totalPages: items.length === 0 ? 0 : 1,
    }
  }

  const items = (payload.items ?? payload.Items ?? []).map(normalizeNotification)
  const totalCount = payload.totalCount ?? payload.TotalCount ?? items.length
  const totalPages =
    payload.totalPages ??
    payload.TotalPages ??
    (totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize))

  return {
    items,
    page: payload.page ?? payload.Page ?? page,
    pageSize: payload.pageSize ?? payload.PageSize ?? pageSize,
    totalCount,
    totalPages,
  }
}

export const notificationsApi = {
  async listUnread() {
    try {
      const response = await apiRequest<RawNotification[] | RawPagedNotifications>(
        "/api/notifications/unread",
        { auth: true }
      )

      if (Array.isArray(response)) {
        return response.map(normalizeNotification)
      }

      return (response.items ?? response.Items ?? []).map(normalizeNotification)
    } catch {
      const paged = await notificationsApi.listPaged(1, 50)
      return paged.items.filter((item) => !item.isRead)
    }
  },

  async listPaged(page = 1, pageSize = 10) {
    const response = await apiRequest<RawPagedNotifications | RawNotification[]>(
      `/api/notifications?page=${page}&pageSize=${pageSize}`,
      { auth: true }
    )

    return normalizePagedResult(response, page, pageSize)
  },

  getUnreadCount() {
    return apiRequest<{ count: number; Count?: number }>(
      "/api/notifications/unread-count",
      { auth: true }
    ).then((result) => ({
      count: result.count ?? result.Count ?? 0,
    }))
  },

  markAllAsRead() {
    return apiRequest<void>("/api/notifications/mark-all-read", {
      method: "POST",
      auth: true,
    })
  },
}
