import type { PlanProductType } from "./plan-types"

export type SiteProvisioningStatus = "Pending" | "Ready" | "Failed"

export type AdminSiteListItem = {
  platformId: string
  userId: string
  userEmail: string | null
  userPhoneNumber: string | null
  userFullName: string
  planId: string
  planName: string
  productType: PlanProductType
  name: string
  slug: string | null
  tenantId: string | null
  storefrontUrl: string | null
  adminUrl: string | null
  provisioningStatus: SiteProvisioningStatus
  provisioningError: string | null
  createdAtUtc: string
}
