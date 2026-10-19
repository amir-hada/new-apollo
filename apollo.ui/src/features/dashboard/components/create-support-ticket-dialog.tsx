import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { FormFloatingField } from "@/components/shared/form-floating-field"
import { FloatingLabelTextarea } from "@/components/shared/floating-label-textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError } from "@/components/ui/field"
import { authFormFieldErrorClass } from "@/features/auth/lib/auth-form-styles"
import { ApiError } from "@/lib/api/client"
import { supportTicketsApi } from "@/lib/api/support-tickets-api"
import { dashboardToast } from "@/lib/dashboard-toast"

type CreateSupportTicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type FieldErrors = {
  subject?: string
  message?: string
  priority?: string
}

export function CreateSupportTicketDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSupportTicketDialogProps) {
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [priority, setPriority] = React.useState(1)
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setSubject("")
    setMessage("")
    setPriority(1)
    setErrors({})
    setFormError(null)
  }, [open])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors: FieldErrors = {}
    if (!subject.trim()) nextErrors.subject = "موضوع تیکت الزامی است."
    if (!message.trim()) nextErrors.message = "متن پیام الزامی است."
    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const created = await supportTicketsApi.create({
        subject: subject.trim(),
        message: message.trim(),
        priority,
      })
      dashboardToast.success("تیکت با موفقیت ثبت شد.", `شماره تیکت: ${created.number}`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          subject: error.errors?.Subject?.[0] ?? error.errors?.["Request.Subject"]?.[0],
          message: error.errors?.Message?.[0] ?? error.errors?.["Request.Message"]?.[0],
          priority: error.errors?.Priority?.[0] ?? error.errors?.["Request.Priority"]?.[0],
        })
        setFormError(error.message)
      } else {
        setFormError("ثبت تیکت ناموفق بود.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-border/60 px-5 py-4">
            <DialogTitle className="text-base font-medium">ثبت تیکت پشتیبانی</DialogTitle>
            <p className="mt-1 text-sm font-light text-muted-foreground">
              موضوع و جزئیات درخواست خود را بنویسید؛ تیم پشتیبانی پاسخ می‌دهد.
            </p>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4">
            <FormFloatingField
              label="موضوع"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              error={errors.subject}
              disabled={submitting}
            />

            <Field data-invalid={Boolean(errors.priority)} className="gap-1">
              <label
                htmlFor="ticket-priority"
                className="text-sm font-normal text-muted-foreground"
              >
                اولویت
              </label>
              <select
                id="ticket-priority"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={priority}
                onChange={(event) => setPriority(Number(event.target.value))}
                disabled={submitting}
              >
                <option value={0}>کم</option>
                <option value={1}>متوسط</option>
                <option value={2}>بالا</option>
                <option value={3}>فوری</option>
              </select>
              {errors.priority ? (
                <FieldError className={authFormFieldErrorClass}>{errors.priority}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.message)} className="gap-1">
              <FloatingLabelTextarea
                label={
                  <>
                    پیام
                    <span className="text-destructive"> *</span>
                  </>
                }
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                invalid={Boolean(errors.message)}
                disabled={submitting}
                rows={5}
              />
              {errors.message ? (
                <FieldError className={authFormFieldErrorClass}>{errors.message}</FieldError>
              ) : null}
            </Field>

            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
          </div>

          <DialogFooter className="!mx-0 !mb-0 gap-2 border-t border-border/60 bg-transparent px-5 py-3 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                انصراف
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  در حال ارسال…
                </>
              ) : (
                "ثبت تیکت"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
