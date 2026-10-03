export type AuthResponse = {
  userId: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  mobileNumber: string | null
  nationalId: string | null
  profilePictureUrl: string | null
  roles: string[]
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
  roles: string[]
}

export type UsernameLoginPayload = {
  username: string
  password: string
}

export type UpdateProfilePayload = {
  firstName?: string
  lastName?: string
  email?: string | null
  nationalId?: string | null
  mobileNumber?: string | null
}

export type AdminUserListItem = {
  userId: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  mobileNumber: string | null
  nationalId: string | null
  profilePictureUrl: string | null
  roles: string[]
  isActive: boolean
  createdAtUtc: string
}
