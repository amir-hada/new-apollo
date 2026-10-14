export type PlanProductType = "Shop"

export type SiteProvisioningStatus = "Pending" | "Ready" | "Failed"

export type UserPlatformListItem = {
  platformId: string
  planId: string
  planName: string
  name: string
  createdAtUtc: string
  productType: PlanProductType
  tenantId: string | null
  tenantSlug: string | null
  storefrontUrl: string | null
  adminUrl: string | null
  provisioningStatus: SiteProvisioningStatus
  provisioningError: string | null
}

export type CreateUserPlatformRequest = {
  planId: string
  name: string
  slug?: string | null
}

export type PlatformSettings = {
  websiteName: string
  websiteLogoFileId: string
  websiteLogoUrl: string | null
  adminUsername: string
  adminPassword: string
  templateCode: string
  slug: string | null
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
  slug?: string | null
}

export type UserPlatformDetail = {
  platformId: string
  planId: string
  planName: string
  name: string
  createdAtUtc: string
  settings: PlatformSettings
  availableTemplates: PlatformTemplateOption[]
  productType: PlanProductType
  tenantId: string | null
  tenantSlug: string | null
  storefrontUrl: string | null
  adminUrl: string | null
  provisioningStatus: SiteProvisioningStatus
  provisioningError: string | null
}

export type ShopSsoRedirect = {
  redirectUrl: string
}

export type PlanOption = {
  planId: string
  name: string
  imageUrl: string | null
  priceInToman: number
  discountedPriceInToman: number | null
  billingPeriod: "Monthly" | "Yearly"
  isAvailable: boolean
  productType?: PlanProductType
}
