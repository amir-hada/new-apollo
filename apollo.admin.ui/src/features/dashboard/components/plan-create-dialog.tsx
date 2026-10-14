import * as React from "react"
import { LayersIcon, Loader2Icon, XIcon } from "lucide-react"

import {
  FormFloatingField,
  FormFloatingTextareaField,
} from "@/components/shared/form-floating-field"
import { FormSelectDropdown } from "@/components/shared/form-select-dropdown"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field"
import { PlanImageUploadField } from "@/features/dashboard/components/plan-image-upload-field"
import { adminApi } from "@/lib/api/admin-api"
import { ApiError } from "@/lib/api/client"
import { uploadPlanImage } from "@/lib/api/files-api"
import {
  PLAN_PRODUCT_TYPE_LABELS,
  type CreatePlanRequest,
  type PlanBillingPeriod,
  type PlanProductType,
} from "@/lib/api/plan-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import { parseNumericInput } from "@/lib/persian/digits"
import { formatTomanInWords } from "@/lib/persian/toman-words"

const PLAN_DESCRIPTION_MAX_LENGTH = 80
const MAX_FILE_SIZE_BYTES = 5_242_880
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

type AvailabilityValue = "available" | "unavailable"
type InstallmentValue = "yes" | "no"

type PlanCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type FieldErrors = {
  name?: string
  description?: string
  price?: string
  discountedPrice?: string
  availability?: string
  installment?: string
  billingPeriod?: string
}

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".")
  return index >= 0 ? fileName.slice(index).toLowerCase() : ""
}

function isAllowedImageFile(file: File) {
  if (ALLOWED_TYPES.includes(file.type)) return true
  const extension = getFileExtension(file.name)
  return [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
}

function parsePrice(value: string) {
  return parseNumericInput(value)
}

const availabilityOptions: { value: AvailabilityValue; label: string }[] = [
  { value: "available", label: "موجود" },
  { value: "unavailable", label: "ناموجود" },
]

const installmentOptions: { value: InstallmentValue; label: string }[] = [
  { value: "yes", label: "دارد" },
  { value: "no", label: "ندارد" },
]

const productTypeOptions: { value: PlanProductType; label: string }[] = [
  { value: "Shop", label: PLAN_PRODUCT_TYPE_LABELS.Shop },
]

const billingPeriodOptions: { value: PlanBillingPeriod; label: string }[] = [
  { value: "Monthly", label: "ماهانه" },
  { value: "Yearly", label: "سالانه" },
]

function PriceHint({ value }: { value: string }) {
  const parsed = parsePrice(value)
  const words = formatTomanInWords(parsed)

  if (!words) {
    return <div className="min-h-4" aria-hidden />
  }

  return (
    <p className="min-h-4 px-1 text-[11px] font-light leading-4 text-muted-foreground">
      {words}
    </p>
  )
}

export function PlanCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: PlanCreateDialogProps) {
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [discountedPrice, setDiscountedPrice] = React.useState("")
  const [availability, setAvailability] = React.useState<AvailabilityValue | null>(
    null
  )
  const [installment, setInstallment] = React.useState<InstallmentValue | null>(
    null
  )
  const [billingPeriod, setBillingPeriod] =
    React.useState<PlanBillingPeriod | null>(null)
  const [productType, setProductType] = React.useState<PlanProductType>("Shop")
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  const resetForm = React.useCallback(() => {
    setName("")
    setDescription("")
    setPrice("")
    setDiscountedPrice("")
    setAvailability(null)
    setInstallment(null)
    setBillingPeriod(null)
    setProductType("Shop")
    setSelectedImage(null)
    setFormError(null)
    setFieldErrors({})
  }, [])

  React.useEffect(() => {
    if (!open) return
    resetForm()
  }, [open, resetForm])

  React.useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      return
    }

    const nextPreview = URL.createObjectURL(selectedImage)
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return nextPreview
    })

    return () => {
      URL.revokeObjectURL(nextPreview)
    }
  }, [selectedImage])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSubmitting) return
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!isAllowedImageFile(file)) {
      dashboardToast.error("فقط فرمت‌های JPG، PNG و WebP مجاز است.")
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      dashboardToast.error("حجم تصویر بیش از حد مجاز است.")
      return
    }

    setSelectedImage(file)
  }

  function validateForm() {
    const errors: FieldErrors = {}

    if (!name.trim()) errors.name = "نام پلن الزامی است."
    if (!description.trim()) {
      errors.description = "توضیحات پلن الزامی است."
    } else if (description.trim().length > PLAN_DESCRIPTION_MAX_LENGTH) {
      errors.description = `توضیحات نباید بیشتر از ${PLAN_DESCRIPTION_MAX_LENGTH.toLocaleString("fa-IR")} کاراکتر باشد.`
    }

    const parsedPrice = parsePrice(price)
    if (!parsedPrice) errors.price = "قیمت باید بیشتر از صفر باشد."

    const parsedDiscountedPrice = discountedPrice.trim()
      ? parsePrice(discountedPrice)
      : null

    if (discountedPrice.trim() && !parsedDiscountedPrice) {
      errors.discountedPrice = "قیمت با تخفیف معتبر نیست."
    } else if (
      parsedDiscountedPrice &&
      parsedPrice &&
      parsedDiscountedPrice >= parsedPrice
    ) {
      errors.discountedPrice = "قیمت با تخفیف باید کمتر از قیمت اصلی باشد."
    }

    if (availability === null) errors.availability = "موجودی را انتخاب کنید."
    if (installment === null) errors.installment = "اقساط را انتخاب کنید."
    if (billingPeriod === null) errors.billingPeriod = "زمانبندی را انتخاب کنید."

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return Object.values(errors)[0] ?? "لطفاً خطاهای فرم را برطرف کنید."
    }

    return null
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      let imageFileId: string | null = null
      if (selectedImage) {
        const uploaded = await uploadPlanImage(selectedImage)
        imageFileId = uploaded.fileId
      }

      const payload: CreatePlanRequest = {
        name: name.trim(),
        productType,
        imageFileId,
        description: description.trim(),
        priceInToman: parsePrice(price)!,
        discountedPriceInToman: discountedPrice.trim()
          ? parsePrice(discountedPrice)
          : null,
        isAvailable: availability === "available",
        allowsInstallment: installment === "yes",
        billingPeriod: billingPeriod!,
      }

      await adminApi.createPlan(payload)
      dashboardToast.success("پلن با موفقیت ایجاد شد.")
      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "ایجاد پلن ناموفق بود. دوباره تلاش کنید."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border border-white/10 bg-card p-0 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:max-w-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <LayersIcon className="size-4" strokeWidth={1.5} />
            </span>
            <DialogTitle className="text-sm font-light leading-none text-foreground">
              افزودن پلن جدید
            </DialogTitle>
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
          <div className="max-h-[min(72vh,640px)] space-y-3 overflow-y-auto px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormFloatingField
                id="plan-name"
                label="نام پلن"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (fieldErrors.name) {
                    setFieldErrors((current) => ({ ...current, name: undefined }))
                  }
                }}
                disabled={isSubmitting}
                error={fieldErrors.name}
              />

              <PlanImageUploadField
                previewUrl={previewUrl}
                disabled={isSubmitting}
                onSelect={() => imageInputRef.current?.click()}
                onRemove={() => setSelectedImage(null)}
              />

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="sm:col-span-2">
                <FormFloatingTextareaField
                  id="plan-description"
                  label="توضیحات (یک خط)"
                  required
                  rows={2}
                  maxLength={PLAN_DESCRIPTION_MAX_LENGTH}
                  value={description}
                  onChange={(event) => {
                    setDescription(
                      event.target.value.slice(0, PLAN_DESCRIPTION_MAX_LENGTH)
                    )
                    if (fieldErrors.description) {
                      setFieldErrors((current) => ({
                        ...current,
                        description: undefined,
                      }))
                    }
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.description}
                  footer={
                    <p className="px-1 text-[11px] font-light text-muted-foreground">
                      {description.length.toLocaleString("fa-IR")} /{" "}
                      {PLAN_DESCRIPTION_MAX_LENGTH.toLocaleString("fa-IR")} کاراکتر
                    </p>
                  }
                />
              </div>

              <div>
                <FormFloatingField
                  id="plan-price"
                  label="قیمت (تومان)"
                  required
                  dir="ltr"
                  inputMode="numeric"
                  className="text-start"
                  value={price}
                  onChange={(event) => {
                    setPrice(event.target.value)
                    if (fieldErrors.price) {
                      setFieldErrors((current) => ({ ...current, price: undefined }))
                    }
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.price}
                  footer={<PriceHint value={price} />}
                />
              </div>

              <div>
                <FormFloatingField
                  id="plan-discounted-price"
                  label="قیمت با تخفیف"
                  dir="ltr"
                  inputMode="numeric"
                  className="text-start"
                  value={discountedPrice}
                  onChange={(event) => {
                    setDiscountedPrice(event.target.value)
                    if (fieldErrors.discountedPrice) {
                      setFieldErrors((current) => ({
                        ...current,
                        discountedPrice: undefined,
                      }))
                    }
                  }}
                  disabled={isSubmitting}
                  error={fieldErrors.discountedPrice}
                  footer={<PriceHint value={discountedPrice} />}
                />
              </div>

              <div className="sm:col-span-2">
                <FormSelectDropdown
                  value={productType}
                  options={productTypeOptions}
                  onChange={setProductType}
                  label="نوع محصول"
                  disabled={isSubmitting}
                  ariaLabel="نوع محصول پلن"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-3">
                <FormSelectDropdown
                  value={availability}
                  options={availabilityOptions}
                  onChange={(value) => {
                    setAvailability(value)
                    if (fieldErrors.availability) {
                      setFieldErrors((current) => ({
                        ...current,
                        availability: undefined,
                      }))
                    }
                  }}
                  label="موجودی"
                  disabled={isSubmitting}
                  ariaLabel="موجودی پلن"
                  error={fieldErrors.availability}
                />

                <FormSelectDropdown
                  value={installment}
                  options={installmentOptions}
                  onChange={(value) => {
                    setInstallment(value)
                    if (fieldErrors.installment) {
                      setFieldErrors((current) => ({
                        ...current,
                        installment: undefined,
                      }))
                    }
                  }}
                  label="اقساط"
                  disabled={isSubmitting}
                  ariaLabel="اقساط پلن"
                  error={fieldErrors.installment}
                />

                <FormSelectDropdown
                  value={billingPeriod}
                  options={billingPeriodOptions}
                  onChange={(value) => {
                    setBillingPeriod(value)
                    if (fieldErrors.billingPeriod) {
                      setFieldErrors((current) => ({
                        ...current,
                        billingPeriod: undefined,
                      }))
                    }
                  }}
                  label="زمانبندی"
                  disabled={isSubmitting}
                  ariaLabel="زمانبندی پلن"
                  error={fieldErrors.billingPeriod}
                />
              </div>
            </div>

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
                "ایجاد پلن"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
