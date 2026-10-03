import * as React from "react"
import { UserIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthenticatedImageUrl } from "@/hooks/use-authenticated-image-url"
import { dashboardToast } from "@/lib/dashboard-toast"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_BYTES = 1_048_576
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".")
  return index >= 0 ? fileName.slice(index).toLowerCase() : ""
}

function isAllowedImageFile(file: File) {
  if (ALLOWED_TYPES.includes(file.type)) return true

  const extension = getFileExtension(file.name)
  return ALLOWED_EXTENSIONS.includes(extension)
}

type SettingsProfileSectionProps = {
  imageUrl: string | null
  initials: string
  displayName: string
  disabled?: boolean
  selectedFile: File | null
  markedForRemoval: boolean
  onSelectFile: (file: File | null) => void
  onMarkForRemoval: () => void
}

export function SettingsProfileSection({
  imageUrl,
  initials,
  displayName,
  disabled,
  selectedFile,
  markedForRemoval,
  onSelectFile,
  onMarkForRemoval,
}: SettingsProfileSectionProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const { displayUrl: serverImageUrl, failed: serverImageFailed } =
    useAuthenticatedImageUrl(markedForRemoval ? null : imageUrl)

  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      return
    }

    const nextPreview = URL.createObjectURL(selectedFile)
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return nextPreview
    })

    return () => {
      URL.revokeObjectURL(nextPreview)
    }
  }, [selectedFile])

  function validateFile(file: File) {
    if (!isAllowedImageFile(file)) {
      return "فقط فرمت‌های JPG، PNG و WebP مجاز است."
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "حجم تصویر باید حداکثر ۱ مگابایت باشد."
    }

    return null
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      dashboardToast.error(validationError)
      return
    }

    onSelectFile(file)
  }

  const displaySrc = markedForRemoval
    ? null
    : previewUrl ?? (serverImageFailed ? null : serverImageUrl)

  const hasPhoto = Boolean(imageUrl || selectedFile) && !markedForRemoval

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />

      <div className="flex min-w-0 items-center gap-4">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-900/80",
            !disabled && "cursor-pointer"
          )}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.click()
            }
          }}
          onKeyDown={(event) => {
            if (disabled) return
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="عکس پروفایل"
        >
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={displayName}
              className="size-full object-cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <span className="sr-only">{initials}</span>
              <UserIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-light text-foreground">عکس پروفایل</p>
          <p className="mt-1 text-xs font-light text-muted-foreground">
            فرمت‌های مجاز: JPG, PNG, WebP | حداکثر حجم: 1MB
          </p>
          {hasPhoto ? (
            <button
              type="button"
              className="mt-2 text-xs font-light text-destructive hover:text-destructive/80"
              disabled={disabled}
              onClick={() => {
                onSelectFile(null)
                onMarkForRemoval()
              }}
            >
              حذف عکس
            </button>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 rounded-xl border-primary/70 bg-transparent px-5 text-xs font-light text-primary hover:bg-primary/10 hover:text-primary"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        آپلود عکس جدید
      </Button>
    </div>
  )
}
