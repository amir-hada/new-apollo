import * as React from "react"
import { CameraIcon, Trash2Icon } from "lucide-react"

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

type ProfilePictureUploadProps = {
  imageUrl: string | null
  initials: string
  displayName: string
  disabled?: boolean
  selectedFile: File | null
  markedForRemoval: boolean
  onSelectFile: (file: File | null) => void
  onMarkForRemoval: () => void
}

export function ProfilePictureUpload({
  imageUrl,
  initials,
  displayName,
  disabled,
  selectedFile,
  markedForRemoval,
  onSelectFile,
  onMarkForRemoval,
}: ProfilePictureUploadProps) {
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

  function handleRemove() {
    onSelectFile(null)
    onMarkForRemoval()
  }

  const displaySrc = markedForRemoval
    ? null
    : previewUrl ?? (serverImageFailed ? null : serverImageUrl)

  const hasPhoto = Boolean(imageUrl || selectedFile) && !markedForRemoval

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative size-24 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-opacity",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          disabled && "pointer-events-none opacity-50"
        )}
        aria-label="انتخاب تصویر پروفایل"
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
          <span className="flex size-full items-center justify-center text-sm font-light text-muted-foreground">
            {initials}
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          <CameraIcon className="size-5 text-white" />
        </span>
      </button>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs font-light text-muted-foreground hover:text-foreground"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          انتخاب تصویر
        </Button>

        {hasPhoto ? (
          <>
            <span className="text-border/80">·</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-light text-muted-foreground hover:text-destructive"
              disabled={disabled}
              onClick={handleRemove}
            >
              <Trash2Icon className="size-3.5" data-icon="inline-start" />
              حذف
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
