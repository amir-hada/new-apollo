const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157"

const FILE_ID_PATTERN =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i

/** آدرس تمیز فایل بدون query یا توکن چسبیده به GUID */
export function sanitizeProtectedFileUrl(url: string | null | undefined) {
  if (!url) return null

  const trimmed = url.trim().split("?")[0]
  if (!trimmed) return null

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return `${API_BASE_URL}/api/files/${trimmed}`
  }

  const filesMatch = trimmed.match(/\/api\/files\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
  if (filesMatch) {
    return `${API_BASE_URL}/api/files/${filesMatch[1]}`
  }

  if (
    (trimmed.startsWith("http://") || trimmed.startsWith("https://")) &&
    !trimmed.includes("/api/files/")
  ) {
    return trimmed
  }

  if (trimmed.startsWith("/api/files/")) {
    const fileId = trimmed.match(FILE_ID_PATTERN)?.[1]
    return fileId ? `${API_BASE_URL}/api/files/${fileId}` : null
  }

  return null
}
