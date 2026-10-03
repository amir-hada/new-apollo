import type { UserProfile } from "@/lib/api/auth-types"

type UserIdentity = Pick<
  UserProfile,
  "firstName" | "lastName" | "username" | "mobileNumber"
>

export function getUserMobile(user: UserIdentity) {
  return user.mobileNumber ?? ""
}

export function getUserDisplayName(user: UserIdentity) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  if (fullName) return fullName
  return user.username
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

  return user.username.slice(0, 2).toUpperCase()
}
