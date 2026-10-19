import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/client"
import { supportTicketsApi } from "@/lib/api/support-tickets-api"
import {
  formatTicketDate,
  supportTicketPriorityLabel,
  supportTicketStatusLabel,
  toTicketPriorityNumber,
  toTicketStatusNumber,
  type SupportTicketDetail,
} from "@/lib/api/support-ticket-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import { cn } from "@/lib/utils"

type SupportTicketDetailDialogProps = {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

export function SupportTicketDetailDialog({
  ticketId,
  open,
  onOpenChange,
  onChanged,
}: SupportTicketDetailDialogProps) {
  const [detail, setDetail] = React.useState<SupportTicketDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [reply, setReply] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open || !ticketId) return
    let cancelled = false
    setLoading(true)
    setReply("")
    ;(async () => {
      try {
        const ticket = await supportTicketsApi.get(ticketId)
        if (!cancelled) setDetail(ticket)
      } catch (error) {
        if (!cancelled) {
          dashboardToast.error(
            error instanceof ApiError ? error.message : "بارگذاری تیکت ناموفق بود."
          )
          onOpenChange(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [onOpenChange, open, ticketId])

  async function handleReply(event: React.FormEvent) {
    event.preventDefault()
    if (!detail || !reply.trim()) return
    setSaving(true)
    try {
      const updated = await supportTicketsApi.reply(detail.id, {
        message: reply.trim(),
      })
      setDetail(updated)
      setReply("")
      dashboardToast.success("پاسخ شما ثبت شد.")
      onChanged()
    } catch (error) {
      dashboardToast.error(
        error instanceof ApiError ? error.message : "ارسال پاسخ ناموفق بود."
      )
    } finally {
      setSaving(false)
    }
  }

  const closed = detail ? toTicketStatusNumber(detail.status) === 4 : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="text-base font-medium">
            {detail?.subject ?? "جزئیات تیکت"}
          </DialogTitle>
          {detail ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                شماره تیکت:{" "}
                <span className="font-medium text-foreground tabular-nums" dir="ltr">
                  {detail.number}
                </span>
              </span>
              <span>
                وضعیت: {supportTicketStatusLabel[toTicketStatusNumber(detail.status)]}
              </span>
              <span>
                اولویت:{" "}
                {supportTicketPriorityLabel[toTicketPriorityNumber(detail.priority)]}
              </span>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {loading || !detail ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              در حال بارگذاری…
            </div>
          ) : (
            detail.messages.map((message) => (
              <div
                key={message.id || `${message.createdAtUtc}-${message.body.slice(0, 12)}`}
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
                  message.isStaff
                    ? "me-auto bg-primary/15"
                    : "ms-auto bg-muted/50"
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                  <span>
                    {message.isStaff ? "پشتیبانی" : "شما"}
                  </span>
                  <span>{formatTicketDate(message.createdAtUtc)}</span>
                </div>
                <p className="whitespace-pre-wrap leading-6">{message.body}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleReply}>
          <div className="space-y-3 border-t border-border/60 px-5 py-4">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
              disabled={saving || closed || loading}
              placeholder={
                closed
                  ? "این تیکت بسته شده است."
                  : "پیام خود را بنویسید…"
              }
              className="w-full resize-none rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary disabled:opacity-60"
            />
          </div>
          <DialogFooter className="!mx-0 !mb-0 gap-2 border-t border-border/60 bg-transparent px-5 py-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              بستن
            </Button>
            <Button type="submit" disabled={saving || closed || !reply.trim()}>
              {saving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  در حال ارسال…
                </>
              ) : (
                "ارسال پاسخ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
