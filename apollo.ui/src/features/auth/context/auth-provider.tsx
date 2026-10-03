import * as React from "react"
import { useNavigate } from "react-router-dom"

import { authApi } from "@/lib/api/auth-api"
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  PhoneAuthPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from "@/lib/api/auth-types"
import { ApiError, SESSION_EXPIRED_MESSAGE } from "@/lib/api/client"
import {
  clearAuthSession,
  getStoredUser,
  isAuthenticated as hasValidSession,
  saveAuthSession,
  saveStoredUser,
} from "@/lib/auth/session"
import { invalidateAuthenticatedMediaCache } from "@/lib/api/files-api"
import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"
import type { UserProfile } from "@/lib/api/auth-types"

type AuthContextValue = {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  completeAuth: (response: AuthResponse) => void
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  verifyPhone: (payload: PhoneAuthPayload) => Promise<void>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<string>
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>
  updateUserProfilePicture: (accessUrl: string | null) => void
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<UserProfile | null>(() => {
    if (!hasValidSession()) return null
    return getStoredUser()
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
        saveStoredUser(profile)
        setUser(profile)
      })
      .catch((error) => {
        if (cancelled) return

        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession()
          setUser(null)
          navigate("/")
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
      saveAuthSession(response)
      setIsBootstrapping(false)
      setUser({
        userId: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        mobileNumber: response.mobileNumber,
        nationalId: response.nationalId,
        profilePictureUrl: response.profilePictureUrl,
      })
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
    async (payload: LoginPayload) => {
      const response = await withLoading(() => authApi.login(payload))
      completeAuth(response)
    },
    [completeAuth, withLoading]
  )

  const register = React.useCallback(
    async (payload: RegisterPayload) => {
      const response = await withLoading(() => authApi.register(payload))
      completeAuth(response)
    },
    [completeAuth, withLoading]
  )

  const verifyPhone = React.useCallback(
    async (payload: PhoneAuthPayload) => {
      const response = await withLoading(() => authApi.verifyPhone(payload))
      completeAuth(response)
    },
    [completeAuth, withLoading]
  )

  const forgotPassword = React.useCallback(
    async (payload: ForgotPasswordPayload) => {
      const response = await withLoading(() => authApi.forgotPassword(payload))
      return response.message
    },
    [withLoading]
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
    navigate("/")
  }, [navigate])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: hasValidSession() && Boolean(user),
      isLoading,
      completeAuth,
      login,
      register,
      verifyPhone,
      forgotPassword,
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
      register,
      verifyPhone,
      forgotPassword,
      updateProfile,
      updateUserProfilePicture,
      refreshUser,
      logout,
    ]
  )

  if (isBootstrapping) {
    return <AuthContext.Provider value={value}>{null}</AuthContext.Provider>
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
