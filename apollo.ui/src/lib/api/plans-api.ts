import { apiRequest } from "./client"
import type { PublicPlanListItem } from "./plan-types"
import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

function normalizePlan(plan: PublicPlanListItem): PublicPlanListItem {
  return {
    ...plan,
    imageUrl: sanitizeProtectedFileUrl(plan.imageUrl),
    isAvailable: plan.isAvailable ?? true,
  }
}

export const plansApi = {
  async getPlans() {
    const plans = await apiRequest<PublicPlanListItem[]>("/api/plans")
    return plans.map(normalizePlan)
  },
}
