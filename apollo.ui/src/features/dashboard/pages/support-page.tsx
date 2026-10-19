import * as React from "react"
import { HeadphonesIcon, MessageSquareIcon, PhoneIcon } from "lucide-react"

import { CreateSupportTicketDialog } from "@/features/dashboard/components/create-support-ticket-dialog"
import { SupportTicketDetailDialog } from "@/features/dashboard/components/support-ticket-detail-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiError } from "@/lib/api/client"
import { supportTicketsApi } from "@/lib/api/support-tickets-api"
import {
  formatTicketDate,
  supportTicketPriorityLabel,
  supportTicketStatusLabel,
  toTicketPriorityNumber,
  toTicketStatusNumber,
  type SupportTicketListItem,
} from "@/lib/api/support-ticket-types"

export function SupportPage() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null)
  const [tickets, setTickets] = React.useState<SupportTicketListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadTickets = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await supportTicketsApi.list(1, 20)
      setTickets(result.items)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "بارگذاری تیکت‌ها ناموفق بود."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
              <MessageSquareIcon className="size-4" />
            </div>
            <CardTitle className="text-base font-medium">تیکت پشتیبانی</CardTitle>
            <CardDescription className="font-light">
              درخواست خود را ثبت کنید و پیگیری کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="font-normal"
              onClick={() => setCreateOpen(true)}
            >
              ثبت تیکت
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
              <PhoneIcon className="size-4" />
            </div>
            <CardTitle className="text-base font-medium">تماس تلفنی</CardTitle>
            <CardDescription className="font-light">
              شنبه تا پنج‌شنبه، ۹ تا ۱۸
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="font-normal" asChild>
              <a href="tel:02177213455">۰۲۱-۷۷۲۱۳۴۵۵</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base font-medium">تیکت‌های من</CardTitle>
          <CardDescription className="font-light">
            برای مشاهده گفتگو و ارسال پاسخ، روی تیکت کلیک کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm font-light text-muted-foreground">در حال بارگذاری…</p>
          ) : error ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => void loadTickets()}
              >
                تلاش مجدد
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-sm font-light text-muted-foreground">
              هنوز تیکتی ثبت نکرده‌اید.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">شماره تیکت</th>
                    <th className="px-3 py-2 text-start font-medium">موضوع</th>
                    <th className="px-3 py-2 text-start font-medium">وضعیت</th>
                    <th className="px-3 py-2 text-start font-medium">اولویت</th>
                    <th className="px-3 py-2 text-start font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer border-t border-border/60 hover:bg-muted/30"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <td
                        className="px-3 py-2 font-medium text-primary tabular-nums"
                        dir="ltr"
                        title="شماره تیکت"
                      >
                        {ticket.number || "—"}
                      </td>
                      <td className="px-3 py-2">{ticket.subject}</td>
                      <td className="px-3 py-2">
                        {supportTicketStatusLabel[toTicketStatusNumber(ticket.status)]}
                      </td>
                      <td className="px-3 py-2">
                        {
                          supportTicketPriorityLabel[
                            toTicketPriorityNumber(ticket.priority)
                          ]
                        }
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatTicketDate(ticket.createdAtUtc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-muted/15">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded bg-background text-primary">
            <HeadphonesIcon className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">سوالات متداول</CardTitle>
            <CardDescription className="font-light">
              پاسخ سریع به رایج‌ترین سوالات کاربران
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-light text-muted-foreground">
            به‌زودی راهنمای کامل پشتیبانی در این بخش قرار می‌گیرد.
          </p>
        </CardContent>
      </Card>

      <CreateSupportTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => void loadTickets()}
      />
      <SupportTicketDetailDialog
        ticketId={selectedTicketId}
        open={Boolean(selectedTicketId)}
        onOpenChange={(open) => {
          if (!open) setSelectedTicketId(null)
        }}
        onChanged={() => void loadTickets()}
      />
    </div>
  )
}
