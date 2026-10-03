import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

import { apiRequest } from "./client"
import type { AdminUserListItem } from "./auth-types"
import type {
  AdminPlanListItem,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "./plan-types"

function normalizeAdminUser(user: AdminUserListItem): AdminUserListItem {
  return {
    ...user,
    isActive: user.isActive ?? true,
    profilePictureUrl: sanitizeProtectedFileUrl(user.profilePictureUrl),
  }
}

function normalizePlan(plan: AdminPlanListItem): AdminPlanListItem {
  return {
    ...plan,
    imageUrl: sanitizeProtectedFileUrl(plan.imageUrl),
    imageFileId: plan.imageFileId ?? null,
    isPublished: plan.isPublished ?? false,
    properties: plan.properties ?? [],
    templates: (plan.templates ?? []).map((template) => ({
      title: template.title,
      code: template.code ?? "",
      imageFileId: template.imageFileId,
      imageUrl: sanitizeProtectedFileUrl(template.imageUrl),
    })),
  }
}

export const adminApi = {
  async getUsers() {
    const users = await apiRequest<AdminUserListItem[]>("/api/admin/users", {
      auth: true,
    })

    return users.map(normalizeAdminUser)
  },

  setUserStatus(userId: string, isActive: boolean) {
    return apiRequest<{ message: string }>(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
      auth: true,
    })
  },

  deleteUser(userId: string) {
    return apiRequest<{ message: string }>(`/api/admin/users/${userId}`, {
      method: "DELETE",
      auth: true,
    })
  },

  async getPlans() {
    const plans = await apiRequest<AdminPlanListItem[]>("/api/admin/plans", {
      auth: true,
    })

    return plans.map(normalizePlan)
  },

  async getPlan(planId: string) {
    const plan = await apiRequest<AdminPlanListItem>(
      `/api/admin/plans/${planId}`,
      {
        auth: true,
      }
    )

    return normalizePlan(plan)
  },

  createPlan(request: CreatePlanRequest) {
    return apiRequest<AdminPlanListItem>("/api/admin/plans", {
      method: "POST",
      body: JSON.stringify(request),
      auth: true,
    })
  },

  updatePlan(planId: string, request: UpdatePlanRequest) {
    return apiRequest<AdminPlanListItem>(`/api/admin/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(request),
      auth: true,
    }).then(normalizePlan)
  },

  deletePlan(planId: string) {
    return apiRequest<{ message: string }>(`/api/admin/plans/${planId}`, {
      method: "DELETE",
      auth: true,
    })
  },
}
