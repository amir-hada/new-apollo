import type { UserProfile } from "@/lib/api/auth-types"

type UserIdentity = Pick<
  UserProfile,
  "firstName" | "lastName" | "username" | "mobileNumber"
>

export function getUserMobile(user: UserIdentity) {
  return user.mobileNumber ?? user.username
}

export function getUserDisplayName(user: UserIdentity) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  if (fullName) return fullName
  return getUserMobile(user)
}

export function getUserInitials(user: UserIdentity) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  if (fullName) {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const mobile = getUserMobile(user)
  return mobile.slice(-2)
}
