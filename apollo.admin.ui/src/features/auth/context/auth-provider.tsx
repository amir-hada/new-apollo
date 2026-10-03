import * as React from "react"
import { useNavigate } from "react-router-dom"

import { authApi } from "@/lib/api/auth-api"
import type {
  AuthResponse,
  UpdateProfilePayload,
  UsernameLoginPayload,
  UserProfile,
} from "@/lib/api/auth-types"
import { ApiError, SESSION_EXPIRED_MESSAGE } from "@/lib/api/client"
import { invalidateAuthenticatedMediaCache } from "@/lib/api/files-api"
import {
  clearAuthSession,
  getStoredUser,
  hasAdminRole,
  isAuthenticated as hasValidSession,
  saveAuthSession,
  saveStoredUser,
} from "@/lib/auth/session"
import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

type AuthContextValue = {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  completeAuth: (response: AuthResponse) => void
  login: (payload: UsernameLoginPayload) => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>
  updateUserProfilePicture: (accessUrl: string | null) => void
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function toUserProfile(response: AuthResponse): UserProfile {
  return {
    userId: response.userId,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    mobileNumber: response.mobileNumber,
    nationalId: response.nationalId,
    profilePictureUrl: response.profilePictureUrl,
    roles: response.roles ?? [],
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<UserProfile | null>(() => {
    if (!hasValidSession()) return null
    const stored = getStoredUser()
    if (!hasAdminRole(stored)) {
      clearAuthSession()
      return null
    }
    return stored
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [isBootstrapping, setIsBootstrapping] = React.useState(() => hasValidSession())

  React.useEffect(() => {
    if (!hasValidSession()) {
      setIsBootstrapping(false)
      return
    }

    let cancelled = false

    void authApi
      .getCurrentUser()
      .then((profile) => {
        if (cancelled) return
        if (!hasAdminRole(profile)) {
          clearAuthSession()
          setUser(null)
          navigate("/auth")
          return
        }
        saveStoredUser(profile)
        setUser(profile)
      })
      .catch((error) => {
        if (cancelled) return

        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession()
          setUser(null)
          navigate("/auth")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  const completeAuth = React.useCallback(
    (response: AuthResponse) => {
      if (!hasAdminRole(toUserProfile(response))) {
        clearAuthSession()
        setUser(null)
        throw new ApiError("دسترسی پنل مدیریت فقط برای مدیران سیستم مجاز است.", 403)
      }

      saveAuthSession(response)
      setIsBootstrapping(false)
      setUser(toUserProfile(response))
      navigate("/dashboard")
    },
    [navigate]
  )

  const withLoading = React.useCallback(
    async <T,>(action: () => Promise<T>) => {
      setIsLoading(true)
      try {
        return await action()
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const login = React.useCallback(
    async (payload: UsernameLoginPayload) => {
      const response = await withLoading(() => authApi.loginWithUsername(payload))
      completeAuth(response)
    },
    [completeAuth, withLoading]
  )

  const updateProfile = React.useCallback(
    async (payload: UpdateProfilePayload) => {
      const profile = await withLoading(() => authApi.updateProfile(payload))
      saveStoredUser(profile)
      setUser(profile)
      return profile
    },
    [withLoading]
  )

  const updateUserProfilePicture = React.useCallback((accessUrl: string | null) => {
    setUser((current) => {
      if (!current) return current
      invalidateAuthenticatedMediaCache(current.profilePictureUrl)
      const nextUser = {
        ...current,
        profilePictureUrl: sanitizeProtectedFileUrl(accessUrl),
      }
      saveStoredUser(nextUser)
      return nextUser
    })
  }, [])

  const refreshUser = React.useCallback(async () => {
    if (!hasValidSession()) {
      throw new ApiError(SESSION_EXPIRED_MESSAGE, 401)
    }

    const profile = await authApi.getCurrentUser()
    saveStoredUser(profile)
    setUser(profile)
  }, [])

  const logout = React.useCallback(() => {
    clearAuthSession()
    setUser(null)
    navigate("/auth")
  }, [navigate])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: hasValidSession() && Boolean(user) && hasAdminRole(user),
      isLoading,
      completeAuth,
      login,
      updateProfile,
      updateUserProfilePicture,
      refreshUser,
      logout,
    }),
    [
      user,
      isLoading,
      completeAuth,
      login,
      updateProfile,
      updateUserProfilePicture,
      refreshUser,
      logout,
    ]
  )

  if (isBootstrapping) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export { ApiError }
