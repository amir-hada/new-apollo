import { getAccessToken, isAccessTokenExpired } from "@/lib/auth/session"

export type ProblemDetails = {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
  extensions?: {
    errors?: Record<string, string[]>
  }
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157"

export const SESSION_EXPIRED_MESSAGE =
  "نشست شما منقضی شده. لطفاً دوباره وارد شوید."

type ApiRequestOptions = RequestInit & {
  /** درخواست‌های محافظت‌شده باید توکن معتبر داشته باشند */
  auth?: boolean
}

function getValidAccessToken() {
  const token = getAccessToken()
  if (!token || isAccessTokenExpired(token)) return null
  return token
}

function requireAccessToken() {
  const token = getValidAccessToken()
  if (!token) {
    throw new ApiError(SESSION_EXPIRED_MESSAGE, 401)
  }

  return token
}

export function mapHttpStatusMessage(status: number, fallback: string) {
  switch (status) {
    case 401:
      return fallback
    case 403:
      return "دسترسی به این عملیات مجاز نیست."
    case 413:
      return "حجم فایل بیش از حد مجاز است."
    default:
      return fallback
  }
}

function getFieldErrors(problem: ProblemDetails | null) {
  return problem?.errors ?? problem?.extensions?.errors
}

function getFirstFieldMessage(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return null
  return Object.values(fieldErrors).flat()[0] ?? null
}

export async function parseApiError(response: Response, fallback: string): Promise<never> {
  const problem = (await response.json().catch(() => null)) as ProblemDetails | null
  const fieldErrors = getFieldErrors(problem)
  const validationMessage = getFirstFieldMessage(fieldErrors)

  throw new ApiError(
    validationMessage ??
      problem?.detail ??
      problem?.title ??
      mapHttpStatusMessage(response.status, fallback),
    response.status,
    fieldErrors
  )
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = false, ...fetchOptions } = options
  const token = auth ? requireAccessToken() : null

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    await parseApiError(response, "خطایی رخ داد.")
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function apiUpload<T>(path: string, formData: FormData, fallback: string) {
  const token = requireAccessToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    await parseApiError(response, fallback)
  }

  return (await response.json()) as T
}

export async function apiDelete(path: string, fallback: string) {
  const token = requireAccessToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok && response.status !== 204) {
    await parseApiError(response, fallback)
  }
}
