import type { AuthResponse, UserProfile } from "@/lib/api/auth-types"
import { clearAuthenticatedMediaCache } from "@/lib/api/files-api"
import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

const ACCESS_TOKEN_KEY = "apollo_admin_access_token"
const REFRESH_TOKEN_KEY = "apollo_admin_refresh_token"
const ACCESS_TOKEN_EXPIRES_AT_KEY = "apollo_admin_access_token_expires_at"
const USER_KEY = "apollo_admin_user"

const TOKEN_EXPIRY_BUFFER_MS = 30_000

function isValidJwtFormat(token: string) {
  const parts = token.split(".")
  return parts.length === 3 && parts.every((part) => part.length > 0)
}

function decodeJwtPayload(token: string) {
  try {
    const base64 = token.split(".")[1]
    if (!base64) return null
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(normalized)) as { exp?: number }
  } catch {
    return null
  }
}

function isStoredAccessTokenExpired() {
  const expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
  if (!expiresAt) return false

  const expiresAtMs = new Date(expiresAt).getTime()
  if (Number.isNaN(expiresAtMs)) return false

  return expiresAtMs <= Date.now() + TOKEN_EXPIRY_BUFFER_MS
}

export function isAccessTokenExpired(token: string | null = getAccessToken()) {
  if (!token || !isValidJwtFormat(token)) return true

  if (isStoredAccessTokenExpired()) return true

  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false

  return payload.exp * 1000 <= Date.now() + TOKEN_EXPIRY_BUFFER_MS
}

function toStoredUser(response: AuthResponse | UserProfile): UserProfile {
  return {
    userId: response.userId,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    mobileNumber: response.mobileNumber,
    nationalId: response.nationalId,
    profilePictureUrl: sanitizeProtectedFileUrl(response.profilePictureUrl),
    roles: response.roles ?? [],
  }
}

export function saveAuthSession(response: AuthResponse) {
  const user = toStoredUser(response)

  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
  localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, response.accessTokenExpiresAt)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function saveStoredUser(user: UserProfile) {
  localStorage.setItem(USER_KEY, JSON.stringify(toStoredUser(user)))
}

export function clearAuthSession() {
  clearAuthenticatedMediaCache()
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    const user = JSON.parse(raw) as UserProfile
    return toStoredUser(user)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const token = getAccessToken()
  return Boolean(token) && !isAccessTokenExpired(token)
}

export function hasAdminRole(user: UserProfile | null = getStoredUser()) {
  if (!user?.roles?.length) return false
  return user.roles.some((role) => role.toLowerCase() === "admin")
}
