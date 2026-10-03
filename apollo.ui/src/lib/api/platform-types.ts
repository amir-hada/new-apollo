export type UserPlatformListItem = {
  platformId: string
  planId: string
  planName: string
  name: string
  createdAtUtc: string
}

export type CreateUserPlatformRequest = {
  planId: string
  name: string
}

export type PlatformSettings = {
  websiteName: string
  websiteLogoFileId: string
  websiteLogoUrl: string | null
  adminUsername: string
  adminPassword: string
  templateCode: string
}

export type PlatformTemplateOption = {
  code: string
  title: string
  imageUrl: string | null
}

export type UpdatePlatformSettingsRequest = {
  websiteName: string
  websiteLogoFileId: string
  adminUsername: string
  adminPassword: string
  templateCode: string
}

export type UserPlatformDetail = {
  platformId: string
  planId: string
  planName: string
  name: string
  createdAtUtc: string
  settings: PlatformSettings
  availableTemplates: PlatformTemplateOption[]
}

export type PlanOption = {
  planId: string
  name: string
  imageUrl: string | null
  priceInToman: number
  discountedPriceInToman: number | null
  billingPeriod: "Monthly" | "Yearly"
  isAvailable: boolean
}
