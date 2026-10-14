import * as React from "react"
import {
  ArrowRightIcon,
  BarChart3Icon,
  ChevronDownIcon,
  GlobeIcon,
  HardDriveIcon,
  ImagePlusIcon,
  LayersIcon,
  Loader2Icon,
  Settings2Icon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { FormFloatingField } from "@/components/shared/form-floating-field"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldError } from "@/components/ui/field"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  SettingsAnimatedTabList,
  SettingsTabTrigger,
} from "@/features/dashboard/components/settings-animated-tab-list"
import {
  PlatformSiteActions,
  ProvisioningStatusBadge,
} from "@/features/dashboard/components/platform-site-actions"
import { SettingsTabPanel } from "@/features/dashboard/components/settings-tab-panel"
import { useAuth } from "@/features/auth"
import { useAuthenticatedImageUrl } from "@/hooks/use-authenticated-image-url"
import { ApiError } from "@/lib/api/client"
import { uploadGeneralFile } from "@/lib/api/files-api"
import { platformsApi } from "@/lib/api/platforms-api"
import type {
  PlatformSettings,
  PlatformTemplateOption,
  UserPlatformDetail,
} from "@/lib/api/platform-types"
import { PLATFORM_SETTING_FIELDS } from "@/lib/platform-setting-fields"
import { dashboardToast } from "@/lib/dashboard-toast"
import {
  buildSlugPreview,
  sanitizeSlugInput,
  validateSlug,
} from "@/lib/site-slug"
import { cn } from "@/lib/utils"

const platformTabs: {
  value: string
  label: string
  icon: LucideIcon
}[] = [
  { value: "settings", label: "تنظیمات", icon: Settings2Icon },
  { value: "reports", label: "گزارشات", icon: BarChart3Icon },
  { value: "resources", label: "منابع", icon: HardDriveIcon },
  { value: "domain", label: "دامنه", icon: GlobeIcon },
]

const MAX_FILE_SIZE_BYTES = 5_242_880
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]

function isAllowedImageFile(file: File) {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
  return [".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(extension)
}

function PlatformEmptyTab({ title }: { title: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/12 bg-card/40 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
        <LayersIcon className="size-5" />
      </span>
      <div className="space-y-1.5">
        <p className="text-sm font-light text-foreground">{title}</p>
        <p className="text-xs font-light text-muted-foreground">
          این بخش به‌زودی فعال می‌شود.
        </p>
      </div>
    </div>
  )
}

function SettingImageField({
  label,
  imageUrl,
  localPreview,
  disabled,
  onUploaded,
  onClear,
}: {
  label: string
  imageUrl: string | null
  localPreview: string | null
  disabled?: boolean
  onUploaded: (fileId: string, preview: string) => void
  onClear: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const remoteUrl = imageUrl && !localPreview ? imageUrl : null
  const { displayUrl: remoteDisplayUrl } = useAuthenticatedImageUrl(remoteUrl)
  const preview = localPreview ?? remoteDisplayUrl

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!isAllowedImageFile(file)) {
      dashboardToast.error("فقط تصویر JPG، PNG، WEBP یا SVG مجاز است.")
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      dashboardToast.error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.")
      return
    }

    setUploading(true)
    try {
      const uploaded = await uploadGeneralFile(file)
      const localPreviewUrl = URL.createObjectURL(file)
      onUploaded(uploaded.fileId, localPreviewUrl)
    } catch (error) {
      dashboardToast.error(
        error instanceof ApiError ? error.message : "آپلود تصویر ناموفق بود."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-light text-muted-foreground">
        {label}
        <span className="text-destructive"> *</span>
      </p>
      <div className="relative inline-flex">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex size-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.03] transition-colors hover:border-primary/40 hover:bg-primary/5",
            preview && "border-solid"
          )}
        >
          {uploading ? (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          ) : preview ? (
            <img
              src={preview}
              alt={label}
              className="size-full object-cover"
            />
          ) : (
            <ImagePlusIcon className="size-5 text-muted-foreground" />
          )}
        </button>
        {preview && !disabled && !uploading ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full border border-white/15 bg-card text-muted-foreground hover:text-destructive"
            aria-label="حذف تصویر"
          >
            <XIcon className="size-3" />
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg"
        className="hidden"
        onChange={(event) => void handleChange(event)}
      />
    </div>
  )
}

function TemplateSelect({
  value,
  options,
  disabled,
  onChange,
}: {
  value: string
  options: PlatformTemplateOption[]
  disabled?: boolean
  onChange: (code: string) => void
}) {
  const selected = options.find((option) => option.code === value) ?? null
  const { displayUrl: selectedImageUrl } = useAuthenticatedImageUrl(
    selected?.imageUrl ?? null
  )

  return (
    <div className="space-y-2">
      <p className="text-xs font-light text-muted-foreground">
        {PLATFORM_SETTING_FIELDS.siteTemplate.label}
        <span className="text-destructive"> *</span>
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled || options.length === 0}
          render={
            <button
              type="button"
              className={cn(
                "group/template-select inline-flex h-14 w-full items-center rounded-lg border border-white/10 bg-background/80 px-2.5 py-2 text-start transition-all duration-200",
                "hover:border-white/20 hover:bg-background",
                "disabled:pointer-events-none disabled:opacity-50",
                "data-popup-open:border-primary/35 data-popup-open:bg-primary/5"
              )}
              aria-label={PLATFORM_SETTING_FIELDS.siteTemplate.label}
            />
          }
        >
          <span className="flex w-full min-w-0 items-center gap-2.5">
            {selected ? (
              <>
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                    <LayersIcon className="size-3.5 text-muted-foreground" />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-light text-foreground">
                  {selected.title}
                </span>
              </>
            ) : (
              <span className="flex-1 text-xs font-light text-muted-foreground">
                {options.length === 0
                  ? "قالبی برای این پلن تعریف نشده است"
                  : "انتخاب قالب"}
              </span>
            )}
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-popup-open/template-select:rotate-180" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--anchor-width)] max-h-64 overflow-y-auto"
        >
          {options.map((option) => (
            <TemplateSelectItem
              key={option.code}
              option={option}
              onSelect={() => onChange(option.code)}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function TemplateSelectItem({
  option,
  onSelect,
}: {
  option: PlatformTemplateOption
  onSelect: () => void
}) {
  const { displayUrl } = useAuthenticatedImageUrl(option.imageUrl)

  return (
    <DropdownMenuItem onClick={onSelect} className="gap-2.5">
      {displayUrl ? (
        <img
          src={displayUrl}
          alt=""
          className="size-8 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
          <LayersIcon className="size-3.5 text-muted-foreground" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-light">
        {option.title}
      </span>
    </DropdownMenuItem>
  )
}

type SettingsDraft = {
  websiteName: string
  websiteLogoFileId: string
  websiteLogoUrl: string | null
  logoLocalPreview: string | null
  adminUsername: string
  adminPassword: string
  templateCode: string
  slug: string
}

function toDraft(settings: PlatformSettings): SettingsDraft {
  return {
    slug: settings.slug ?? "",
    websiteName: settings.websiteName,
    websiteLogoFileId: settings.websiteLogoFileId,
    websiteLogoUrl: settings.websiteLogoUrl,
    logoLocalPreview: null,
    adminUsername: settings.adminUsername,
    adminPassword: settings.adminPassword,
    templateCode: settings.templateCode,
  }
}

function PlatformSettingsTab({
  platformId,
  settings,
  slugLocked,
  availableTemplates,
  onSaved,
}: {
  platformId: string
  settings: PlatformSettings
  slugLocked: boolean
  availableTemplates: PlatformTemplateOption[]
  onSaved: (detail: UserPlatformDetail) => void
}) {
  const [draft, setDraft] = React.useState(() => toDraft(settings))
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setDraft(toDraft(settings))
    setError(null)
  }, [settings])

  async function handleSave() {
    if (!slugLocked) {
      const slugError = validateSlug(draft.slug)
      if (slugError) {
        setError(slugError)
        return
      }
    }
    if (!draft.websiteName.trim()) {
      setError(`مقدار «${PLATFORM_SETTING_FIELDS.websiteName.label}» الزامی است.`)
      return
    }
    if (!draft.websiteLogoFileId.trim()) {
      setError(`مقدار «${PLATFORM_SETTING_FIELDS.websiteLogo.label}» الزامی است.`)
      return
    }
    if (!draft.adminUsername.trim()) {
      setError(
        `مقدار «${PLATFORM_SETTING_FIELDS.adminUsername.label}» الزامی است.`
      )
      return
    }
    if (!draft.adminPassword.trim()) {
      setError(
        `مقدار «${PLATFORM_SETTING_FIELDS.adminPassword.label}» الزامی است.`
      )
      return
    }
    if (!draft.templateCode.trim()) {
      setError(`مقدار «${PLATFORM_SETTING_FIELDS.siteTemplate.label}» الزامی است.`)
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      const detail = await platformsApi.updatePlatformSettings(platformId, {
        websiteName: draft.websiteName.trim(),
        websiteLogoFileId: draft.websiteLogoFileId.trim(),
        adminUsername: draft.adminUsername.trim(),
        adminPassword: draft.adminPassword.trim(),
        templateCode: draft.templateCode.trim(),
        ...(slugLocked ? {} : { slug: draft.slug.trim() }),
      })
      onSaved(detail)
      dashboardToast.success("تنظیمات ذخیره شد.")
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "ذخیره تنظیمات ناموفق بود."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <FormFloatingField
          id="platform-setting-slug"
          label="آدرس سایت (slug)"
          required
          dir="ltr"
          className="text-start"
          autoComplete="off"
          value={draft.slug}
          disabled={isSaving || slugLocked}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              slug: sanitizeSlugInput(event.target.value),
            }))
          }
          footer={
            <p
              dir="ltr"
              className="px-1 text-start text-[11px] font-light text-muted-foreground"
            >
              {buildSlugPreview(draft.slug)}
              {slugLocked ? " — پس از آماده شدن سایت قابل تغییر نیست" : ""}
            </p>
          }
        />

        <FormFloatingField
          id="platform-setting-website-name"
          label={PLATFORM_SETTING_FIELDS.websiteName.label}
          required
          value={draft.websiteName}
          disabled={isSaving}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              websiteName: event.target.value,
            }))
          }
        />

        <SettingImageField
          label={PLATFORM_SETTING_FIELDS.websiteLogo.label}
          imageUrl={draft.websiteLogoUrl}
          localPreview={draft.logoLocalPreview}
          disabled={isSaving}
          onUploaded={(fileId, preview) =>
            setDraft((current) => ({
              ...current,
              websiteLogoFileId: fileId,
              websiteLogoUrl: null,
              logoLocalPreview: preview,
            }))
          }
          onClear={() =>
            setDraft((current) => ({
              ...current,
              websiteLogoFileId: "",
              websiteLogoUrl: null,
              logoLocalPreview: null,
            }))
          }
        />

        <FormFloatingField
          id="platform-setting-admin-username"
          label={PLATFORM_SETTING_FIELDS.adminUsername.label}
          required
          value={draft.adminUsername}
          disabled={isSaving}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              adminUsername: event.target.value,
            }))
          }
        />

        <FormFloatingField
          id="platform-setting-admin-password"
          label={PLATFORM_SETTING_FIELDS.adminPassword.label}
          required
          type="password"
          autoComplete="new-password"
          value={draft.adminPassword}
          disabled={isSaving}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              adminPassword: event.target.value,
            }))
          }
        />

        <TemplateSelect
          value={draft.templateCode}
          options={availableTemplates}
          disabled={isSaving}
          onChange={(templateCode) =>
            setDraft((current) => ({ ...current, templateCode }))
          }
        />
      </div>

      {error ? (
        <FieldError className="text-xs font-light">{error}</FieldError>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={isSaving}
          className="h-9 rounded-lg bg-primary px-4 text-xs font-light text-primary-foreground hover:bg-primary/90"
          onClick={() => void handleSave()}
        >
          {isSaving ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              در حال ذخیره
            </>
          ) : (
            "ذخیره تنظیمات"
          )}
        </Button>
      </div>
    </div>
  )
}

export function PlatformDetailsPage() {
  const { platformId } = useParams<{ platformId: string }>()
  const { logout } = useAuth()
  const [platform, setPlatform] = React.useState<UserPlatformDetail | null>(
    null
  )
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<string>(
    platformTabs[0].value
  )

  const reloadPlatform = React.useCallback(async () => {
    if (!platformId) return
    try {
      setPlatform(await platformsApi.getPlatform(platformId))
    } catch {
      // keep current state; user can refresh manually
    }
  }, [platformId])

  React.useEffect(() => {
    let cancelled = false

    async function loadPlatform() {
      if (!platformId) {
        setError("شناسه پلتفرم نامعتبر است.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const detail = await platformsApi.getPlatform(platformId)
        if (cancelled) return
        setPlatform(detail)
        setError(null)
      } catch (err) {
        if (cancelled) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setError(
          err instanceof Error ? err.message : "بارگذاری پلتفرم ناموفق بود."
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadPlatform()

    return () => {
      cancelled = true
    }
  }, [platformId, logout])

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-light text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        در حال بارگذاری پلتفرم
      </div>
    )
  }

  if (error || !platform) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm font-light text-destructive" role="alert">
          {error ?? "پلتفرم یافت نشد."}
        </p>
        <Link
          to="/dashboard/platforms"
          className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRightIcon className="size-3.5" />
          بازگشت
        </Link>
      </div>
    )
  }

  return (
    <div className="grid w-full min-w-0 gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/dashboard/platforms"
            className="inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRightIcon className="size-3.5" />
            بازگشت
          </Link>

          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {platform.name}
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs font-light text-muted-foreground">
            <ProvisioningStatusBadge status={platform.provisioningStatus} />
            {platform.tenantSlug ? (
              <span dir="ltr">{platform.tenantSlug}</span>
            ) : null}
          </div>

          {platform.provisioningStatus === "Failed" &&
          platform.provisioningError ? (
            <p className="text-xs font-light text-destructive" role="alert">
              {platform.provisioningError}
            </p>
          ) : null}
        </div>

        <PlatformSiteActions
          platformId={platform.platformId}
          status={platform.provisioningStatus}
          storefrontUrl={platform.storefrontUrl}
          onChanged={() => void reloadPlatform()}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-8">
        <SettingsAnimatedTabList activeTab={activeTab}>
          {platformTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <SettingsTabTrigger key={tab.value} value={tab.value}>
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
                  {tab.label}
                </span>
              </SettingsTabTrigger>
            )
          })}
        </SettingsAnimatedTabList>

        <TabsContent value="settings" className="outline-none">
          <SettingsTabPanel active={activeTab === "settings"}>
            <PlatformSettingsTab
              platformId={platform.platformId}
              settings={platform.settings}
              slugLocked={
                platform.provisioningStatus === "Ready" || platform.tenantId !== null
              }
              availableTemplates={platform.availableTemplates}
              onSaved={setPlatform}
            />
          </SettingsTabPanel>
        </TabsContent>

        {platformTabs
          .filter((tab) => tab.value !== "settings")
          .map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="outline-none"
            >
              <SettingsTabPanel active={activeTab === tab.value}>
                <PlatformEmptyTab title={tab.label} />
              </SettingsTabPanel>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  )
}
