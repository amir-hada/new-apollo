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

export type AdminPlanListItem = {
  planId: string
  name: string
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
