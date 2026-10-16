import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SettingsField } from "@/features/dashboard/components/settings-field"
import { SettingsSaveConfirmDialog } from "@/features/dashboard/components/settings-save-confirm-dialog"
import { adminApi } from "@/lib/api/admin-api"
import { ApiError, SESSION_EXPIRED_MESSAGE } from "@/lib/api/client"
import type { PlatformSmsSettings } from "@/lib/api/sms-settings-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import { cn } from "@/lib/utils"

type FormState = {
  isEnabled: boolean
  apiKey: string
  lineNumber: string
  otpTemplateId: string
  otpParameterName: string
  orderTemplateId: string
  orderParameterName: string
  orderMessageTemplate: string
}

const settingsActionButtonClass =
  "h-10 rounded-xl border-primary/70 bg-transparent px-5 text-xs font-light text-primary hover:bg-primary/10 hover:text-primary"

function toForm(settings: PlatformSmsSettings): FormState {
  return {
    isEnabled: settings.isEnabled,
    apiKey: "",
    lineNumber: settings.lineNumber?.toString() ?? "",
    otpTemplateId: settings.otpTemplateId ? String(settings.otpTemplateId) : "",
    otpParameterName: settings.otpParameterName || "CODE",
    orderTemplateId: settings.orderTemplateId ? String(settings.orderTemplateId) : "",
    orderParameterName: settings.orderParameterName || "ORDER",
    orderMessageTemplate:
      settings.orderMessageTemplate ||
      "سفارش {orderNumber} به مبلغ {total} ثبت شد.",
  }
}

export function SmsPanelPage() {
  const [form, setForm] = React.useState<FormState | null>(null)
  const [maskedKey, setMaskedKey] = React.useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const settings = await adminApi.getSmsSettings()
        if (cancelled) return
        setForm(toForm(settings))
        setMaskedKey(settings.apiKeyMasked)
        setHasApiKey(settings.hasApiKey)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          dashboardToast.error(SESSION_EXPIRED_MESSAGE)
        } else {
          dashboardToast.error("بارگذاری تنظیمات پنل پیامکی ناموفق بود.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function confirmSave() {
    if (!form) return
    setSaving(true)
    try {
      const line = form.lineNumber.trim()
      const updated = await adminApi.updateSmsSettings({
        isEnabled: form.isEnabled,
        apiKey: form.apiKey.trim() || null,
        lineNumber: line ? Number(line) : null,
        otpTemplateId: Number(form.otpTemplateId || 0),
        otpParameterName: form.otpParameterName.trim() || "CODE",
        orderTemplateId: Number(form.orderTemplateId || 0),
        orderParameterName: form.orderParameterName.trim() || "ORDER",
        orderMessageTemplate: form.orderMessageTemplate.trim(),
      })
      setForm(toForm(updated))
      setMaskedKey(updated.apiKeyMasked)
      setHasApiKey(updated.hasApiKey)
      setSaveConfirmOpen(false)
      dashboardToast.success("تنظیمات پنل پیامکی ذخیره شد")
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        dashboardToast.error(SESSION_EXPIRED_MESSAGE)
      } else {
        dashboardToast.error("ذخیره تنظیمات پیامکی ناموفق بود.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        در حال بارگذاری...
      </div>
    )
  }

  return (
    <>
      <div className="grid min-h-0 w-full min-w-0 flex-1 gap-6 overflow-y-auto">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium">پنل پیامکی مشترک (SMS.ir)</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            یک کلید API و اعتبار برای کل پلتفرم آپولو و همه فروشگاه‌ها مشترک است. فروشگاه‌ها فقط
            می‌توانند قابلیت‌های OTP و پیامک سفارش را روشن/خاموش کنند.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div>
            <p className="text-sm">فعال‌سازی پنل</p>
            <p className="text-xs text-muted-foreground">در صورت خاموش بودن، ارسال OTP انجام نمی‌شود.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isEnabled}
            onClick={() => setForm((f) => (f ? { ...f, isEnabled: !f.isEnabled } : f))}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              form.isEnabled ? "bg-primary" : "bg-white/15"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-6 rounded-full bg-white transition-transform",
                form.isEnabled ? "start-5" : "start-0.5"
              )}
            />
          </button>
        </div>

        <div className="settings-fields-stagger grid gap-5 sm:grid-cols-2">
          <SettingsField
            id="sms-api-key"
            label="کلید API (x-api-key)"
            type="password"
            dir="ltr"
            className="text-start"
            value={form.apiKey}
            placeholder={hasApiKey ? `ذخیره‌شده: ${maskedKey ?? "****"}` : "کلید را وارد کنید"}
            onChange={(event) => setForm((f) => (f ? { ...f, apiKey: event.target.value } : f))}
            hint="برای حفظ کلید فعلی این فیلد را خالی بگذارید."
          />
          <SettingsField
            id="sms-line"
            label="شماره خط (برای ارسال متنی/سفارش)"
            dir="ltr"
            className="text-start"
            inputMode="numeric"
            value={form.lineNumber}
            onChange={(event) =>
              setForm((f) => (f ? { ...f, lineNumber: event.target.value.replace(/\D/g, "") } : f))
            }
          />
          <SettingsField
            id="sms-otp-template"
            label="شناسه قالب OTP (Verify)"
            dir="ltr"
            className="text-start"
            inputMode="numeric"
            value={form.otpTemplateId}
            onChange={(event) =>
              setForm((f) =>
                f ? { ...f, otpTemplateId: event.target.value.replace(/\D/g, "") } : f
              )
            }
          />
          <SettingsField
            id="sms-otp-param"
            label="نام پارامتر قالب OTP"
            dir="ltr"
            className="text-start"
            value={form.otpParameterName}
            onChange={(event) =>
              setForm((f) => (f ? { ...f, otpParameterName: event.target.value } : f))
            }
            hint="مثلاً CODE مطابق قالب تعریف‌شده در پنل SMS.ir"
          />
          <SettingsField
            id="sms-order-template"
            label="شناسه قالب سفارش (اختیاری)"
            dir="ltr"
            className="text-start"
            inputMode="numeric"
            value={form.orderTemplateId}
            onChange={(event) =>
              setForm((f) =>
                f ? { ...f, orderTemplateId: event.target.value.replace(/\D/g, "") } : f
              )
            }
          />
          <SettingsField
            id="sms-order-param"
            label="نام پارامتر قالب سفارش"
            dir="ltr"
            className="text-start"
            value={form.orderParameterName}
            onChange={(event) =>
              setForm((f) => (f ? { ...f, orderParameterName: event.target.value } : f))
            }
          />
          <div className="sm:col-span-2">
            <SettingsField
              id="sms-order-message"
              label="متن سفارش (اگر قالب Verify ندارید)"
              value={form.orderMessageTemplate}
              onChange={(event) =>
                setForm((f) => (f ? { ...f, orderMessageTemplate: event.target.value } : f))
              }
              hint="جایگزین‌ها: {orderNumber} و {total} — نیاز به شماره خط دارد."
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-6">
          <Button
            type="button"
            variant="outline"
            className={settingsActionButtonClass}
            disabled={saving}
            onClick={() => setSaveConfirmOpen(true)}
          >
            {saving ? (
              <>
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
                در حال ذخیره...
              </>
            ) : (
              "ذخیره پنل پیامکی"
            )}
          </Button>
        </div>
      </div>

      <SettingsSaveConfirmDialog
        open={saveConfirmOpen}
        saving={saving}
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={() => void confirmSave()}
      />
    </>
  )
}
