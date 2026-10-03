import { apiRequest } from "./client"
import type {
  AuthResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginHistoryEntry,
  LoginPayload,
  PhoneAuthPayload,
  RegisterPayload,
  SendOtpPayload,
  SendOtpResponse,
  UpdateProfilePayload,
  UserProfile,
} from "./auth-types"

export const authApi = {
  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  sendOtp(payload: SendOtpPayload) {
    return apiRequest<SendOtpResponse>("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  verifyPhone(payload: PhoneAuthPayload) {
    return apiRequest<AuthResponse>("/api/auth/verify/phone", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  loginWithPhone(payload: PhoneAuthPayload) {
    return apiRequest<AuthResponse>("/api/auth/login/phone", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  registerWithPhone(payload: PhoneAuthPayload) {
    return apiRequest<AuthResponse>("/api/auth/register/phone", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return apiRequest<ForgotPasswordResponse>("/api/auth/forgot-password", {
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

  getLoginHistory(count = 5) {
    return apiRequest<LoginHistoryEntry[]>(
      `/api/auth/me/login-history?count=${count}`,
      { auth: true }
    )
  },
}
