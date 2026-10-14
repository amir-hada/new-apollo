import * as React from "react"
import {
  ChevronDownIcon,
  ImageIcon,
  LayersIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

import { FormFloatingField } from "@/components/shared/form-floating-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldError } from "@/components/ui/field"
import { useAuthenticatedImageUrl } from "@/hooks/use-authenticated-image-url"
import { ApiError } from "@/lib/api/client"
import { platformsApi } from "@/lib/api/platforms-api"
import type { PlanOption } from "@/lib/api/platform-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import {
  buildSlugPreview,
  sanitizeSlugInput,
  validateSlug,
} from "@/lib/site-slug"
import { cn } from "@/lib/utils"

type PlatformCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type FieldErrors = {
  planId?: string
  name?: string
  slug?: string
}

function formatPrice(value: number) {
  return value.toLocaleString("fa-IR")
}

function getDisplayPrice(plan: PlanOption) {
  if (
    plan.discountedPriceInToman !== null &&
    plan.discountedPriceInToman < plan.priceInToman
  ) {
    return plan.discountedPriceInToman
  }
  return plan.priceInToman
}

function PlanOptionThumb({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) {
  const { displayUrl } = useAuthenticatedImageUrl(src)

  if (!displayUrl) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[4px] border border-white/10 bg-background/80 text-muted-foreground">
        <ImageIcon className="size-4" />
      </span>
    )
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className="size-10 shrink-0 rounded-[4px] border border-white/10 object-cover"
    />
  )
}

function PlatformPlanSelect({
  value,
  options,
  onChange,
  error,
  disabled,
}: {
  value: string | null
  options: PlanOption[]
  onChange: (value: string) => void
  error?: string | null
  disabled?: boolean
}) {
  const selected = value
    ? options.find((option) => option.planId === value)
    : null
  const invalid = Boolean(error)

  return (
    <div className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <button
              type="button"
              className={cn(
                "group/plan-select inline-flex h-auto min-h-14 w-full items-center rounded-lg border px-2.5 py-2 text-start transition-all duration-200",
                "border-white/10 bg-background/80 hover:border-white/20 hover:bg-background",
                "disabled:pointer-events-none disabled:opacity-50",
                "data-popup-open:border-primary/35 data-popup-open:bg-primary/5",
                invalid && "border-destructive/50"
              )}
              aria-label="انتخاب پلن"
              aria-invalid={invalid || undefined}
            />
          }
        >
          <span className="flex w-full min-w-0 items-center gap-2.5">
            {selected ? (
              <>
                <PlanOptionThumb src={selected.imageUrl} alt={selected.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-light text-foreground">
                    {selected.name}
                  </span>
                  <span className="mt-0.5 block text-xs font-light text-emerald-300">
                    {formatPrice(getDisplayPrice(selected))} تومان
                  </span>
                </span>
              </>
            ) : (
              <span className="flex-1 text-xs font-light text-muted-foreground">
                انتخاب پلن
              </span>
            )}
            <ChevronDownIcon
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-popup-open/plan-select:rotate-180"
            />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--anchor-width)] max-h-64 overflow-y-auto"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.planId}
              onClick={() => onChange(option.planId)}
              className="gap-2.5"
            >
              <PlanOptionThumb src={option.imageUrl} alt={option.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-light">
                  {option.name}
                </span>
                <span className="mt-0.5 block text-xs font-light text-emerald-300">
                  {formatPrice(getDisplayPrice(option))} تومان
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? <FieldError className="mt-1.5">{error}</FieldError> : null}
    </div>
  )
}

export function PlatformCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: PlatformCreateDialogProps) {
  const [planOptions, setPlanOptions] = React.useState<PlanOption[]>([])
  const [planId, setPlanId] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  const resetForm = React.useCallback(() => {
    setPlanId(null)
    setName("")
    setSlug("")
    setFormError(null)
    setFieldErrors({})
  }, [])

  React.useEffect(() => {
    if (!open) return

    let cancelled = false

    void platformsApi
      .getPlanOptions()
      .then((options) => {
        if (!cancelled) {
          setPlanOptions(
            options.filter((option) => (option.productType ?? "Shop") === "Shop")
          )
        }
      })
      .catch(() => {
        if (!cancelled) setPlanOptions([])
      })

    return () => {
      cancelled = true
    }
  }, [open])

  React.useEffect(() => {
    if (open) resetForm()
  }, [open, resetForm])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSubmitting) return
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  function validate() {
    const errors: FieldErrors = {}
    if (!planId) errors.planId = "پلن را انتخاب کنید."
    if (!name.trim()) errors.name = "نام پلتفرم الزامی است."
    const slugError = validateSlug(slug)
    if (slugError) errors.slug = slugError
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate() || !planId) {
      setFormError("لطفاً خطاهای فرم را برطرف کنید.")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await platformsApi.createPlatform({
        planId,
        name: name.trim(),
        slug: slug.trim(),
      })
      dashboardToast.success("پلتفرم با موفقیت ایجاد شد.")
      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "ایجاد پلتفرم ناموفق بود. دوباره تلاش کنید."
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border border-white/10 bg-card p-0 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <LayersIcon className="size-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-light leading-none text-foreground">
                افزودن پلتفرم جدید
              </DialogTitle>
              <p className="mt-1 text-[11px] font-light text-muted-foreground">
                اطلاعات اولیه
              </p>
            </div>
          </div>

          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 shrink-0 rounded-lg"
                disabled={isSubmitting}
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">بستن</span>
          </DialogClose>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-3 px-4 py-4">
            <FormFloatingField
              id="platform-name"
              label="نام پلتفرم"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (fieldErrors.name) {
                  setFieldErrors((current) => ({
                    ...current,
                    name: undefined,
                  }))
                }
              }}
              disabled={isSubmitting}
              error={fieldErrors.name}
            />

            <FormFloatingField
              id="platform-slug"
              label="آدرس سایت (slug)"
              required
              dir="ltr"
              className="text-start"
              autoComplete="off"
              value={slug}
              onChange={(event) => {
                setSlug(sanitizeSlugInput(event.target.value))
                if (fieldErrors.slug) {
                  setFieldErrors((current) => ({
                    ...current,
                    slug: undefined,
                  }))
                }
              }}
              disabled={isSubmitting}
              error={fieldErrors.slug}
              footer={
                <p
                  dir="ltr"
                  className="px-1 text-start text-[11px] font-light text-muted-foreground"
                >
                  {buildSlugPreview(slug)}
                </p>
              }
            />

            <PlatformPlanSelect
              value={planId}
              options={planOptions}
              onChange={(nextPlanId) => {
                setPlanId(nextPlanId)
                if (fieldErrors.planId) {
                  setFieldErrors((current) => ({
                    ...current,
                    planId: undefined,
                  }))
                }
              }}
              disabled={isSubmitting || planOptions.length === 0}
              error={fieldErrors.planId}
            />

            {planOptions.length === 0 ? (
              <p className="text-xs font-light text-muted-foreground">
                در حال حاضر پلن فعالی برای انتخاب وجود ندارد.
              </p>
            ) : null}

            {formError ? (
              <FieldError className="text-xs font-light">{formError}</FieldError>
            ) : null}
          </div>

          <DialogFooter className="!mx-0 !mb-0 gap-2 border-t border-white/10 bg-background/30 px-4 py-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              className="h-8 px-3 text-xs font-light text-muted-foreground hover:text-foreground"
              onClick={() => handleOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-8 rounded-lg bg-primary px-4 text-xs font-light text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  در حال ذخیره
                </>
              ) : (
                "ایجاد پلتفرم"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
