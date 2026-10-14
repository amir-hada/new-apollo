export type PlanProperty = {
  title: string
  value: string
}

export type PlanTemplate = {
  title: string
  code: string
  imageFileId: string
  imageUrl: string | null
}

export type PlanBillingPeriod = "Monthly" | "Yearly"

export type PlanProductType = "Shop"

export const PLAN_PRODUCT_TYPE_LABELS: Record<PlanProductType, string> = {
  Shop: "سایت فروشگاهی",
}

export function normalizePlanProductType(
  value: PlanProductType | number | string | null | undefined,
): PlanProductType {
  if (value === 1 || value === "1" || value === "Shop") return "Shop"
  return "Shop"
}

export type AdminPlanListItem = {
  planId: string
  name: string
  productType: PlanProductType
  imageUrl: string | null
  imageFileId: string | null
  description: string
  priceInToman: number
  discountedPriceInToman: number | null
  isAvailable: boolean
  allowsInstallment: boolean
  isPublished: boolean
  billingPeriod: PlanBillingPeriod
  properties: PlanProperty[]
  templates: PlanTemplate[]
  createdAtUtc: string
}

export type CreatePlanRequest = {
  name: string
  productType: PlanProductType
  imageFileId: string | null
  description: string
  priceInToman: number
  discountedPriceInToman: number | null
  isAvailable: boolean
  allowsInstallment: boolean
  billingPeriod: PlanBillingPeriod
}

export type UpdatePlanRequest = {
  name: string
  productType: PlanProductType
  imageFileId: string | null
  description: string
  priceInToman: number
  discountedPriceInToman: number | null
  isAvailable: boolean
  allowsInstallment: boolean
  isPublished: boolean
  billingPeriod: PlanBillingPeriod
  properties: PlanProperty[]
  templates: Array<{
    title: string
    code: string
    imageFileId: string
  }>
}
