import * as React from "react"
import { Loader2Icon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminApi } from "@/lib/api/admin-api"
import { ApiError, SESSION_EXPIRED_MESSAGE } from "@/lib/api/client"
import {
  formatTicketDate,
  supportTicketPriorityLabel,
  supportTicketPriorityOptions,
  supportTicketStatusLabel,
  supportTicketStatusOptions,
  toTicketPriorityNumber,
  toTicketStatusNumber,
  type SupportTicketDetail,
  type SupportTicketListItem,
} from "@/lib/api/support-ticket-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import { cn } from "@/lib/utils"

const selectClass =
  "h-10 rounded-xl border border-border/70 bg-background px-3 text-sm font-light outline-none focus-visible:border-primary"

export function SupportPage() {
  const [tickets, setTickets] = React.useState<SupportTicketListItem[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [detail, setDetail] = React.useState<SupportTicketDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [reply, setReply] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<number | "">("")
  const [priorityFilter, setPriorityFilter] = React.useState<number | "">("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)

  const loadTickets = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await adminApi.getSupportTickets({
        page,
        pageSize: 15,
        status: statusFilter === "" ? null : statusFilter,
        priority: priorityFilter === "" ? null : priorityFilter,
        search,
      })
      setTickets(result.items)
      setTotalPages(Math.max(1, result.totalPages))
      setTotalCount(result.totalCount)
      if (result.items.length > 0) {
        setSelectedId((current) =>
          current && result.items.some((item) => item.id === current)
            ? current
            : result.items[0].id
        )
      } else {
        setSelectedId(null)
        setDetail(null)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        dashboardToast.error(SESSION_EXPIRED_MESSAGE)
      } else {
        dashboardToast.error(
          error instanceof Error ? error.message : "بارگذاری تیکت‌ها ناموفق بود."
        )
      }
    } finally {
      setLoading(false)
    }
  }, [page, priorityFilter, search, statusFilter])

  const loadDetail = React.useCallback(async (ticketId: string) => {
    setDetailLoading(true)
    try {
      const ticket = await adminApi.getSupportTicket(ticketId)
      setDetail(ticket)
    } catch (error) {
      dashboardToast.error(
        error instanceof Error ? error.message : "بارگذاری جزئیات تیکت ناموفق بود."
      )
    } finally {
      setDetailLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  React.useEffect(() => {
    if (!selectedId) return
    void loadDetail(selectedId)
  }, [loadDetail, selectedId])

  async function handleReply(event: React.FormEvent) {
    event.preventDefault()
    if (!detail || !reply.trim()) return
    setSaving(true)
    try {
      const updated = await adminApi.replySupportTicket(detail.id, reply.trim())
      setDetail(updated)
      setReply("")
      dashboardToast.success("پاسخ ثبت شد.")
      void loadTickets()
    } catch (error) {
      dashboardToast.error(
        error instanceof Error ? error.message : "ارسال پاسخ ناموفق بود."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: number) {
    if (!detail) return
    setSaving(true)
    try {
      const updated = await adminApi.updateSupportTicketStatus(detail.id, status)
      setDetail(updated)
      dashboardToast.success("وضعیت تیکت به‌روز شد.")
      void loadTickets()
    } catch (error) {
      dashboardToast.error(
        error instanceof Error ? error.message : "تغییر وضعیت ناموفق بود."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handlePriorityChange(priority: number) {
    if (!detail) return
    setSaving(true)
    try {
      const updated = await adminApi.updateSupportTicketPriority(detail.id, priority)
      setDetail(updated)
      dashboardToast.success("اولویت تیکت به‌روز شد.")
      void loadTickets()
    } catch (error) {
      dashboardToast.error(
        error instanceof Error ? error.message : "تغییر اولویت ناموفق بود."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setPage(1)
              setSearch(event.target.value)
            }}
            placeholder="جستجو: شماره، موضوع، کاربر…"
            className="h-10 rounded-xl ps-9 font-light"
          />
        </div>
        <select
          className={selectClass}
          value={statusFilter}
          onChange={(event) => {
            setPage(1)
            setStatusFilter(event.target.value === "" ? "" : Number(event.target.value))
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {supportTicketStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={priorityFilter}
          onChange={(event) => {
            setPage(1)
            setPriorityFilter(
              event.target.value === "" ? "" : Number(event.target.value)
            )
          }}
        >
          <option value="">همه اولویت‌ها</option>
          {supportTicketPriorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={() => void loadTickets()}
        >
          <RefreshCwIcon className="size-4" />
          بروزرسانی
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80">
          <div className="border-b border-border/60 px-4 py-3 text-sm text-muted-foreground">
            {loading ? "در حال بارگذاری…" : `${totalCount.toLocaleString("fa-IR")} تیکت`}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                در حال بارگذاری
              </div>
            ) : tickets.length === 0 ? (
              <p className="p-6 text-sm font-light text-muted-foreground">
                تیکتی یافت نشد.
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {tickets.map((ticket) => {
                  const active = ticket.id === selectedId
                  return (
                    <li key={ticket.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(ticket.id)}
                        className={cn(
                          "flex w-full flex-col gap-1 px-4 py-3 text-start transition-colors",
                          active ? "bg-primary/10" : "hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            شماره تیکت:{" "}
                            <span className="font-medium text-foreground tabular-nums" dir="ltr">
                              {ticket.number}
                            </span>
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {supportTicketStatusLabel[toTicketStatusNumber(ticket.status)]}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-sm font-medium">{ticket.subject}</p>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span>{ticket.userDisplayName ?? "کاربر"}</span>
                          <span>
                            {supportTicketPriorityLabel[toTicketPriorityNumber(ticket.priority)]}
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              قبلی
            </Button>
            <span className="text-xs text-muted-foreground">
              صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              بعدی
            </Button>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80">
          {!selectedId ? (
            <p className="p-8 text-sm font-light text-muted-foreground">
              یک تیکت را از لیست انتخاب کنید.
            </p>
          ) : detailLoading && !detail ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              در حال بارگذاری جزئیات…
            </div>
          ) : detail ? (
            <>
              <div className="space-y-3 border-b border-border/60 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      شماره تیکت:{" "}
                      <span className="font-medium text-foreground tabular-nums" dir="ltr">
                        {detail.number}
                      </span>
                    </p>
                    <h2 className="mt-1 text-lg font-medium">{detail.subject}</h2>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ایجاد: {formatTicketDate(detail.createdAtUtc)}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs text-muted-foreground">
                    وضعیت
                    <select
                      className={cn(selectClass, "w-full")}
                      value={toTicketStatusNumber(detail.status)}
                      disabled={saving}
                      onChange={(event) =>
                        void handleStatusChange(Number(event.target.value))
                      }
                    >
                      {supportTicketStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    اولویت
                    <select
                      className={cn(selectClass, "w-full")}
                      value={toTicketPriorityNumber(detail.priority)}
                      disabled={saving}
                      onChange={(event) =>
                        void handlePriorityChange(Number(event.target.value))
                      }
                    >
                      {supportTicketPriorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                  <p>کاربر: {detail.userDisplayName ?? "—"}</p>
                  <p dir="ltr">{detail.userPhoneNumber ?? "—"}</p>
                  <p>مسئول: {detail.assignedToAdminName ?? "—"}</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {detail.messages.map((message) => (
                  <div
                    key={message.id || `${message.createdAtUtc}-${message.body.slice(0, 12)}`}
                    className={cn(
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
                      message.isStaff
                        ? "ms-auto bg-primary/15 text-foreground"
                        : "me-auto bg-muted/50"
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                      <span>{message.isStaff ? `پشتیبانی · ${message.senderName}` : message.senderName}</span>
                      <span>{formatTicketDate(message.createdAtUtc)}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleReply}
                className="space-y-3 border-t border-border/60 px-5 py-4"
              >
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={3}
                  placeholder={
                    toTicketStatusNumber(detail.status) === 4
                      ? "برای پاسخ، ابتدا وضعیت تیکت را از «بسته» خارج کنید."
                      : "پاسخ خود را بنویسید…"
                  }
                  disabled={saving || toTicketStatusNumber(detail.status) === 4}
                  className="w-full resize-none rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary disabled:opacity-60"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      !reply.trim() ||
                      toTicketStatusNumber(detail.status) === 4
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        در حال ارسال…
                      </>
                    ) : (
                      "ارسال پاسخ"
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}
