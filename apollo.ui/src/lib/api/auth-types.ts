export type AuthResponse = {
  userId: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  mobileNumber: string | null
  nationalId: string | null
  profilePictureUrl: string | null
  roles?: string[]
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
}

export type UserProfile = {
  userId: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  mobileNumber: string | null
  nationalId: string | null
  profilePictureUrl: string | null
  roles?: string[]
}

/** Phone users: username equals mobileNumber; name/email may be empty. */

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

export type SendOtpPayload = {
  mobileNumber: string
}

export type SendOtpResponse = {
  message: string
  debugCode?: string | null
}

export type PhoneAuthPayload = {
  mobileNumber: string
  code: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ForgotPasswordResponse = {
  message: string
}

export type UpdateProfilePayload = {
  firstName?: string
  lastName?: string
  email?: string | null
  nationalId?: string | null
}

export type LoginHistoryEntry = {
  id: string
  loggedInAtUtc: string
  ipAddress: string
  device: string
}
