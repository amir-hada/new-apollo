import { apiRequest } from "./client"
import type {
  AuthResponse,
  UpdateProfilePayload,
  UsernameLoginPayload,
  UserProfile,
} from "./auth-types"

export const authApi = {
  loginWithUsername(payload: UsernameLoginPayload) {
    return apiRequest<AuthResponse>("/api/auth/login/username", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  getCurrentUser() {
    return apiRequest<UserProfile>("/api/auth/me", { auth: true })
  },

  updateProfile(payload: UpdateProfilePayload) {
    return apiRequest<UserProfile>("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
      auth: true,
    })
  },
}
