import * as React from "react"
import {
  ArrowRightIcon,
  FileTextIcon,
  GripVerticalIcon,
  LayoutTemplateIcon,
  ListChecksIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { SettingsField } from "@/features/dashboard/components/settings-field"
import { SettingsSelect } from "@/features/dashboard/components/settings-select"
import {
  SettingsAnimatedTabList,
  SettingsTabTrigger,
} from "@/features/dashboard/components/settings-animated-tab-list"
import { SettingsTabPanel } from "@/features/dashboard/components/settings-tab-panel"
import { PlanImageUploadField } from "@/features/dashboard/components/plan-image-upload-field"
import { useAuth } from "@/features/auth/context/auth-provider"
import { useAuthenticatedImageUrl } from "@/hooks/use-authenticated-image-url"
import { adminApi } from "@/lib/api/admin-api"
import { ApiError } from "@/lib/api/client"
import { uploadPlanImage } from "@/lib/api/files-api"
import type {
  AdminPlanListItem,
  PlanBillingPeriod,
  UpdatePlanRequest,
} from "@/lib/api/plan-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import { parseNumericInput } from "@/lib/persian/digits"
import { formatTomanInWords } from "@/lib/persian/toman-words"
import { cn } from "@/lib/utils"

const PLAN_DESCRIPTION_MAX_LENGTH = 80
const MAX_FILE_SIZE_BYTES = 5_242_880
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const settingsActionButtonClass =
  "h-10 rounded-xl border-primary/70 bg-transparent px-5 text-xs font-light text-primary hover:bg-primary/10 hover:text-primary"

const settingsControlClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-light shadow-none outline-none transition-colors hover:bg-white/[0.06] focus-visible:border-primary/50 focus-visible:bg-white/[0.05] focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-80"

const planTabs = [
  { value: "basic", label: "اطلاعات اولیه", icon: FileTextIcon },
  { value: "properties", label: "ویژگی‌ها", icon: ListChecksIcon },
  { value: "templates", label: "قالب‌ها", icon: LayoutTemplateIcon },
] as const

type PlanTab = (typeof planTabs)[number]["value"]
type AvailabilityValue = "available" | "unavailable"
type InstallmentValue = "yes" | "no"
type PublishedValue = "published" | "draft"

type PropertyDraft = { id: string; title: string; value: string }
type TemplateDraft = {
  id: string
  title: string
  code: string
  imageFileId: string
  imageUrl: string | null
  selectedImage: File | null
  imageRemoved: boolean
}

function createPropertyDraft(title = "", value = ""): PropertyDraft {
  return { id: crypto.randomUUID(), title, value }
}

function createTemplateDraft(
  title = "",
  code = "",
  imageFileId = "",
  imageUrl: string | null = null
): TemplateDraft {
  return {
    id: crypto.randomUUID(),
    title,
    code,
    imageFileId,
    imageUrl,
    selectedImage: null,
    imageRemoved: false,
  }
}

function templateHasImage(template: TemplateDraft) {
  if (template.selectedImage) return true
  if (template.imageRemoved) return false
  return Boolean(template.imageFileId.trim() || template.imageUrl)
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

function SettingsTextarea({
  id,
  label,
  value,
  onChange,
  disabled,
  maxLength,
  rows = 2,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  maxLength?: number
  rows?: number
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id} className="text-xs font-light text-foreground">
        {label}
      </Label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          settingsControlClass,
          "min-h-[4.5rem] resize-none py-3 leading-6 text-foreground"
        )}
      />
      {maxLength ? (
        <p className="px-1 text-[11px] font-light text-muted-foreground">
          {value.length.toLocaleString("fa-IR")} /{" "}
          {maxLength.toLocaleString("fa-IR")} کاراکتر
        </p>
      ) : null}
    </div>
  )
}

function PriceHint({ value }: { value: string }) {
  const words = formatTomanInWords(parsePrice(value))
  if (!words) {
    return <div className="mt-[5px] min-h-4" aria-hidden />
  }

  return (
    <p className="mt-[5px] min-h-4 px-1 text-[11px] font-light leading-4 text-muted-foreground">
      {words}
    </p>
  )
}

function TemplateImageField({
  template,
  disabled,
  onSelectFile,
  onRemove,
}: {
  template: TemplateDraft
  disabled?: boolean
  onSelectFile: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = React.useState<string | null>(null)
  const remoteUrl =
    !template.selectedImage && !template.imageRemoved
      ? template.imageUrl
      : null
  const { displayUrl: remoteDisplayUrl } = useAuthenticatedImageUrl(remoteUrl)
  const preview = localPreview ?? remoteDisplayUrl

  React.useEffect(() => {
    if (!template.selectedImage) {
      setLocalPreview((current) => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      return
    }

    const next = URL.createObjectURL(template.selectedImage)
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return next
    })

    return () => {
      URL.revokeObjectURL(next)
    }
  }, [template.selectedImage])

  return (
    <>
      <PlanImageUploadField
        variant="settings"
        previewUrl={preview}
        disabled={disabled}
        emptyLabel="آپلود تصویر قالب"
        previewAlt={template.title || "پیش‌نمایش قالب"}
        onSelect={() => inputRef.current?.click()}
        onRemove={onRemove}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(event) => {
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
          onSelectFile(file)
        }}
      />
    </>
  )
}

export function PlanDetailsPage() {
  const { planId } = useParams<{ planId: string }>()
  const { logout } = useAuth()
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = React.useState<PlanTab>("basic")
  const [plan, setPlan] = React.useState<AdminPlanListItem | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [discountedPrice, setDiscountedPrice] = React.useState("")
  const [availability, setAvailability] =
    React.useState<AvailabilityValue>("available")
  const [installment, setInstallment] = React.useState<InstallmentValue>("no")
  const [published, setPublished] = React.useState<PublishedValue>("draft")
  const [billingPeriod, setBillingPeriod] =
    React.useState<PlanBillingPeriod>("Monthly")
  const [properties, setProperties] = React.useState<PropertyDraft[]>([
    createPropertyDraft(),
  ])
  const [draggedPropertyId, setDraggedPropertyId] = React.useState<string | null>(
    null
  )
  const [dragOverPropertyId, setDragOverPropertyId] = React.useState<
    string | null
  >(null)
  const [templates, setTemplates] = React.useState<TemplateDraft[]>([
    createTemplateDraft(),
  ])
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = React.useState(false)

  const { displayUrl: existingImageUrl } = useAuthenticatedImageUrl(
    imageRemoved || selectedImage ? null : plan?.imageUrl
  )

  function hydrateFromPlan(next: AdminPlanListItem) {
    setPlan(next)
    setName(next.name)
    setDescription(next.description.slice(0, PLAN_DESCRIPTION_MAX_LENGTH))
    setPrice(String(next.priceInToman))
    setDiscountedPrice(
      next.discountedPriceInToman ? String(next.discountedPriceInToman) : ""
    )
    setAvailability(next.isAvailable ? "available" : "unavailable")
    setInstallment(next.allowsInstallment ? "yes" : "no")
    setPublished(next.isPublished ? "published" : "draft")
    setBillingPeriod(next.billingPeriod)
    setProperties(
      next.properties.length > 0
        ? next.properties.map((property) =>
            createPropertyDraft(property.title, property.value)
          )
        : [createPropertyDraft()]
    )
    setTemplates(
      next.templates.length > 0
        ? next.templates.map((template) =>
            createTemplateDraft(
              template.title,
              template.code,
              template.imageFileId,
              template.imageUrl
            )
          )
        : [createTemplateDraft()]
    )
    setSelectedImage(null)
    setImageRemoved(false)
  }

  React.useEffect(() => {
    if (!planId) {
      setLoadError("شناسه پلن معتبر نیست.")
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadPlan() {
      setIsLoading(true)

      try {
        const result = await adminApi.getPlan(planId!)
        if (cancelled) return
        hydrateFromPlan(result)
        setLoadError(null)
      } catch (err) {
        if (cancelled) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setPlan(null)
        setLoadError(
          err instanceof Error ? err.message : "بارگذاری جزئیات پلن ناموفق بود."
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadPlan()

    return () => {
      cancelled = true
    }
  }, [planId, logout])

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
    setImageRemoved(false)
  }

  async function handleSave() {
    if (!plan) return

    if (!name.trim()) {
      dashboardToast.error("نام پلن الزامی است.")
      setActiveTab("basic")
      return
    }

    if (!description.trim()) {
      dashboardToast.error("توضیحات پلن الزامی است.")
      setActiveTab("basic")
      return
    }

    const parsedPrice = parsePrice(price)
    if (!parsedPrice) {
      dashboardToast.error("قیمت باید بیشتر از صفر باشد.")
      setActiveTab("basic")
      return
    }

    const parsedDiscountedPrice = discountedPrice.trim()
      ? parsePrice(discountedPrice)
      : null

    if (discountedPrice.trim() && !parsedDiscountedPrice) {
      dashboardToast.error("قیمت با تخفیف معتبر نیست.")
      setActiveTab("basic")
      return
    }

    if (parsedDiscountedPrice && parsedDiscountedPrice >= parsedPrice) {
      dashboardToast.error("قیمت با تخفیف باید کمتر از قیمت اصلی باشد.")
      setActiveTab("basic")
      return
    }

    const filledProperties = properties.filter(
      (property) => property.title.trim() || property.value.trim()
    )
    if (
      filledProperties.some(
        (property) => !property.title.trim() || !property.value.trim()
      )
    ) {
      dashboardToast.error("برای هر ویژگی، عنوان و مقدار باید تکمیل شوند.")
      setActiveTab("properties")
      return
    }

    const filledTemplates = templates.filter(
      (template) =>
        template.title.trim() ||
        template.code.trim() ||
        templateHasImage(template)
    )
    if (
      filledTemplates.some(
        (template) =>
          !template.title.trim() ||
          !template.code.trim() ||
          !templateHasImage(template)
      )
    ) {
      dashboardToast.error("برای هر قالب، عنوان، کد و تصویر باید تکمیل شوند.")
      setActiveTab("templates")
      return
    }

    setIsSubmitting(true)

    try {
      let imageFileId: string | null = null
      if (selectedImage) {
        const uploaded = await uploadPlanImage(selectedImage)
        imageFileId = uploaded.fileId
      } else if (!imageRemoved) {
        imageFileId = plan.imageFileId
      }

      const resolvedTemplates = []
      for (const template of filledTemplates) {
        let templateImageFileId = template.imageFileId.trim()

        if (template.selectedImage) {
          const uploaded = await uploadPlanImage(template.selectedImage)
          templateImageFileId = uploaded.fileId
        } else if (template.imageRemoved) {
          templateImageFileId = ""
        }

        resolvedTemplates.push({
          title: template.title.trim(),
          code: template.code.trim(),
          imageFileId: templateImageFileId,
        })
      }

      const payload: UpdatePlanRequest = {
        name: name.trim(),
        imageFileId,
        description: description.trim(),
        priceInToman: parsedPrice,
        discountedPriceInToman: parsedDiscountedPrice,
        isAvailable: availability === "available",
        allowsInstallment: installment === "yes",
        isPublished: published === "published",
        billingPeriod,
        properties: filledProperties.map((property) => ({
          title: property.title.trim(),
          value: property.value.trim(),
        })),
        templates: resolvedTemplates,
      }

      const updated = await adminApi.updatePlan(plan.planId, payload)
      hydrateFromPlan(updated)
      dashboardToast.success("تغییرات پلن ذخیره شد.")
    } catch (error) {
      dashboardToast.error(
        error instanceof ApiError
          ? error.message
          : "ذخیره تغییرات ناموفق بود. دوباره تلاش کنید."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 flex-1 items-center justify-center gap-2 text-sm font-light text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin text-primary" />
        در حال بارگذاری جزئیات پلن
      </div>
    )
  }

  if (loadError || !plan) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm font-light text-destructive" role="alert">
          {loadError ?? "پلن یافت نشد."}
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-lg border-white/10 text-xs font-light"
          render={<Link to="/dashboard/plans" />}
        >
          بازگشت به پلن‌ها
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <div className="shrink-0">
        <Link
          to="/dashboard/plans"
          className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRightIcon className="size-3.5" />
          برگشت
        </Link>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as PlanTab)}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <SettingsAnimatedTabList activeTab={activeTab} className="shrink-0 overflow-x-hidden">
          {planTabs.map((tab) => (
            <SettingsTabTrigger key={tab.value} value={tab.value}>
              <tab.icon strokeWidth={1.5} />
              {tab.label}
            </SettingsTabTrigger>
          ))}
        </SettingsAnimatedTabList>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <TabsContent value="basic" className="outline-none">
            <SettingsTabPanel active={activeTab === "basic"} className="gap-0">
              <div className="settings-fields-stagger grid w-full min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <SettingsField
                    id="plan-details-name"
                    label="نام پلن"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <Label className="text-xs font-light text-foreground">
                    تصویر پلن
                  </Label>
                  <PlanImageUploadField
                    variant="settings"
                    previewUrl={previewUrl ?? existingImageUrl}
                    disabled={isSubmitting}
                    onSelect={() => imageInputRef.current?.click()}
                    onRemove={() => {
                      setSelectedImage(null)
                      setImageRemoved(true)
                    }}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="min-w-0 sm:col-span-2">
                  <SettingsTextarea
                    id="plan-details-description"
                    label="توضیحات"
                    value={description}
                    maxLength={PLAN_DESCRIPTION_MAX_LENGTH}
                    disabled={isSubmitting}
                    onChange={(value) =>
                      setDescription(value.slice(0, PLAN_DESCRIPTION_MAX_LENGTH))
                    }
                  />
                </div>

                <div className="min-w-0">
                  <SettingsField
                    id="plan-details-price"
                    label="قیمت (تومان)"
                    dir="ltr"
                    inputMode="numeric"
                    className="text-start tabular-nums"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    disabled={isSubmitting}
                  />
                  <PriceHint value={price} />
                </div>

                <div className="min-w-0">
                  <SettingsField
                    id="plan-details-discounted-price"
                    label="قیمت با تخفیف"
                    dir="ltr"
                    inputMode="numeric"
                    className="text-start tabular-nums"
                    value={discountedPrice}
                    onChange={(event) => setDiscountedPrice(event.target.value)}
                    disabled={isSubmitting}
                  />
                  <PriceHint value={discountedPrice} />
                </div>

                <SettingsSelect
                  id="plan-details-availability"
                  label="موجودی"
                  value={availability}
                  disabled={isSubmitting}
                  onChange={setAvailability}
                  options={[
                    { value: "available", label: "موجود" },
                    { value: "unavailable", label: "ناموجود" },
                  ]}
                />

                <SettingsSelect
                  id="plan-details-installment"
                  label="اقساط"
                  value={installment}
                  disabled={isSubmitting}
                  onChange={setInstallment}
                  options={[
                    { value: "yes", label: "دارد" },
                    { value: "no", label: "ندارد" },
                  ]}
                />

                <SettingsSelect
                  id="plan-details-billing"
                  label="زمانبندی"
                  value={billingPeriod}
                  disabled={isSubmitting}
                  onChange={setBillingPeriod}
                  options={[
                    { value: "Monthly", label: "ماهانه" },
                    { value: "Yearly", label: "سالانه" },
                  ]}
                />

                <SettingsSelect
                  id="plan-details-published"
                  label="انتشار"
                  value={published}
                  disabled={isSubmitting}
                  onChange={setPublished}
                  options={[
                    { value: "draft", label: "پیش‌نویس" },
                    { value: "published", label: "منتشر شده" },
                  ]}
                />
              </div>
            </SettingsTabPanel>
          </TabsContent>

          <TabsContent value="properties" className="outline-none">
            <SettingsTabPanel active={activeTab === "properties"} className="gap-4">
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-3 text-xs font-light leading-6 text-amber-100/90">
                ادمین محترم، ویژگی‌ها دقیقاً به ترتیبی که شما نوشته‌اید نمایش داده
                خواهند شد. اگر نیاز به تغییر دارید، ترتیب ویژگی‌ها را جابه‌جا کنید.
              </p>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="sr-only">جابه‌جایی</span>
                  <span className="text-xs font-light text-foreground">عنوان</span>
                  <span className="text-xs font-light text-foreground">مقدار</span>
                  <span className="sr-only">حذف</span>
                </div>

                <ul className="divide-y divide-white/10">
                  {properties.map((property) => (
                    <li
                      key={property.id}
                      onDragOver={(event) => {
                        event.preventDefault()
                        if (dragOverPropertyId !== property.id) {
                          setDragOverPropertyId(property.id)
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (!draggedPropertyId || draggedPropertyId === property.id) {
                          setDraggedPropertyId(null)
                          setDragOverPropertyId(null)
                          return
                        }

                        setProperties((current) => {
                          const fromIndex = current.findIndex(
                            (item) => item.id === draggedPropertyId
                          )
                          const toIndex = current.findIndex(
                            (item) => item.id === property.id
                          )
                          if (fromIndex < 0 || toIndex < 0) return current
                          const next = [...current]
                          const [moved] = next.splice(fromIndex, 1)
                          next.splice(toIndex, 0, moved)
                          return next
                        })
                        setDraggedPropertyId(null)
                        setDragOverPropertyId(null)
                      }}
                      className={cn(
                        "grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-2 px-3 py-2.5 transition-colors hover:bg-white/[0.03]",
                        draggedPropertyId === property.id && "opacity-50",
                        dragOverPropertyId === property.id &&
                          draggedPropertyId !== property.id &&
                          "bg-primary/10"
                      )}
                    >
                      <button
                        type="button"
                        draggable={!isSubmitting}
                        disabled={isSubmitting}
                        onDragStart={() => setDraggedPropertyId(property.id)}
                        onDragEnd={() => {
                          setDraggedPropertyId(null)
                          setDragOverPropertyId(null)
                        }}
                        className="justify-self-center cursor-grab text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing disabled:pointer-events-none disabled:opacity-40"
                        aria-label="جابه‌جایی ویژگی"
                      >
                        <GripVerticalIcon className="size-4" strokeWidth={1.5} />
                      </button>
                      <Input
                        id={`property-title-${property.id}`}
                        value={property.title}
                        disabled={isSubmitting}
                        className={settingsControlClass}
                        onChange={(event) =>
                          setProperties((current) =>
                            current.map((item) =>
                              item.id === property.id
                                ? { ...item, title: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                      <Input
                        id={`property-value-${property.id}`}
                        value={property.value}
                        disabled={isSubmitting}
                        className={settingsControlClass}
                        onChange={(event) =>
                          setProperties((current) =>
                            current.map((item) =>
                              item.id === property.id
                                ? { ...item, value: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        disabled={isSubmitting || properties.length === 1}
                        className="justify-self-center text-destructive transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-30"
                        onClick={() =>
                          setProperties((current) =>
                            current.length === 1
                              ? current
                              : current.filter((item) => item.id !== property.id)
                          )
                        }
                        aria-label="حذف ویژگی"
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 border-t border-white/10 px-3 text-xs font-light text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                  onClick={() =>
                    setProperties((current) => [
                      ...current,
                      createPropertyDraft(),
                    ])
                  }
                >
                  <PlusIcon className="size-3.5" />
                  افزودن ویژگی
                </button>
              </div>
            </SettingsTabPanel>
          </TabsContent>

          <TabsContent value="templates" className="outline-none">
            <SettingsTabPanel active={activeTab === "templates"} className="gap-0">
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="text-xs font-light text-foreground">عنوان</span>
                  <span className="text-xs font-light text-foreground">کد</span>
                  <span className="text-xs font-light text-foreground">تصویر</span>
                  <span className="sr-only">حذف</span>
                </div>

                <ul className="divide-y divide-white/10">
                  {templates.map((template) => (
                    <li
                      key={template.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-2 px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <Input
                        id={`template-title-${template.id}`}
                        value={template.title}
                        disabled={isSubmitting}
                        className={settingsControlClass}
                        onChange={(event) =>
                          setTemplates((current) =>
                            current.map((item) =>
                              item.id === template.id
                                ? { ...item, title: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                      <Input
                        id={`template-code-${template.id}`}
                        value={template.code}
                        disabled={isSubmitting}
                        className={settingsControlClass}
                        onChange={(event) =>
                          setTemplates((current) =>
                            current.map((item) =>
                              item.id === template.id
                                ? { ...item, code: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                      <TemplateImageField
                        template={template}
                        disabled={isSubmitting}
                        onSelectFile={(file) =>
                          setTemplates((current) =>
                            current.map((item) =>
                              item.id === template.id
                                ? {
                                    ...item,
                                    selectedImage: file,
                                    imageRemoved: false,
                                  }
                                : item
                            )
                          )
                        }
                        onRemove={() =>
                          setTemplates((current) =>
                            current.map((item) =>
                              item.id === template.id
                                ? {
                                    ...item,
                                    selectedImage: null,
                                    imageRemoved: true,
                                    imageFileId: "",
                                    imageUrl: null,
                                  }
                                : item
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        disabled={isSubmitting || templates.length === 1}
                        className="justify-self-center text-destructive transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-30"
                        onClick={() =>
                          setTemplates((current) =>
                            current.length === 1
                              ? current
                              : current.filter((item) => item.id !== template.id)
                          )
                        }
                        aria-label="حذف قالب"
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 border-t border-white/10 px-3 text-xs font-light text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                  onClick={() =>
                    setTemplates((current) => [
                      ...current,
                      createTemplateDraft(),
                    ])
                  }
                >
                  <PlusIcon className="size-3.5" />
                  افزودن قالب
                </button>
              </div>
            </SettingsTabPanel>
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex shrink-0 justify-end border-t border-white/10 pt-4">
        <Button
          type="button"
          variant="outline"
          className={settingsActionButtonClass}
          disabled={isSubmitting}
          onClick={() => void handleSave()}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
              در حال ذخیره...
            </>
          ) : (
            "ذخیره تغییرات"
          )}
        </Button>
      </div>
    </div>
  )
}
