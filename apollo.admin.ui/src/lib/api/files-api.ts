import { apiDelete, apiUpload } from "@/lib/api/client"
import { getAccessToken, isAccessTokenExpired } from "@/lib/auth/session"
import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

const blobCache = new Map<string, string>()

export function clearAuthenticatedMediaCache() {
  for (const objectUrl of blobCache.values()) {
    URL.revokeObjectURL(objectUrl)
  }
  blobCache.clear()
}

export function invalidateAuthenticatedMediaCache(url?: string | null) {
  if (!url) {
    clearAuthenticatedMediaCache()
    return
  }

  const resolvedUrl = resolveFileUrl(url)
  if (!resolvedUrl) return

  const cached = blobCache.get(resolvedUrl)
  if (!cached) return

  URL.revokeObjectURL(cached)
  blobCache.delete(resolvedUrl)
}

export function resolveFileUrl(url: string | null | undefined) {
  return sanitizeProtectedFileUrl(url)
}

export type StoredFileDto = {
  fileId: string
  objectKey: string
  contentType: string
  sizeBytes: number
  purpose: string
  accessUrl: string
}

export type UploadFileResponse = {
  file: {
    fileId: string
    objectKey: string
    contentType: string
    sizeBytes: number
    purpose: string
    accessUrl: string
  }
  profilePictureUrl: string | null
}

export async function uploadPlanImage(file: File): Promise<StoredFileDto> {
  const formData = new FormData()
  formData.append("file", file, file.name)

  return apiUpload<StoredFileDto>(
    "/api/files/upload?purpose=plan-image",
    formData,
    "آپلود تصویر پلن ناموفق بود."
  )
}

export async function uploadProfilePicture(file: File): Promise<UploadFileResponse> {
  const formData = new FormData()
  formData.append("file", file, file.name)

  return apiUpload<UploadFileResponse>(
    "/api/files/profile-picture",
    formData,
    "آپلود فایل ناموفق بود."
  )
}

export async function removeProfilePicture() {
  await apiDelete("/api/files/profile-picture", "حذف تصویر ناموفق بود.")
}

export function isProtectedFileUrl(url: string | null | undefined) {
  if (!url) return false
  if (url.includes("/api/files/")) return true
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url)
}

export async function fetchAuthenticatedBlobUrl(
  url: string
): Promise<string | null> {
  const token = getAccessToken()
  if (!token || isAccessTokenExpired(token)) return null

  const resolvedUrl = resolveFileUrl(url)
  if (!resolvedUrl) return null

  const cached = blobCache.get(resolvedUrl)
  if (cached) return cached

  const response = await fetch(resolvedUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return null

  const blob = await response.blob()
  const type = blob.type.toLowerCase()
  const looksLikeImage =
    !type ||
    type.startsWith("image/") ||
    type === "text/xml" ||
    type === "application/xml"
  if (!looksLikeImage) return null

  const objectUrl = URL.createObjectURL(blob)
  blobCache.set(resolvedUrl, objectUrl)
  return objectUrl
}
