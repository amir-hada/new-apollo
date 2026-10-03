export type AppNotification = {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAtUtc: string
}

export type PagedNotifications = {
  items: AppNotification[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
