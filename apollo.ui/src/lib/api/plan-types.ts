export type PlanProperty = {
  title: string
  value: string
}

export type PlanBillingPeriod = "Monthly" | "Yearly"

export type PlanProductType = "Shop"

export type PublicPlanListItem = {
  planId: string
  name: string
  imageUrl: string | null
  description: string
  priceInToman: number
  discountedPriceInToman: number | null
  isAvailable: boolean
  allowsInstallment: boolean
  billingPeriod: PlanBillingPeriod
  properties: PlanProperty[]
  productType?: PlanProductType
}
