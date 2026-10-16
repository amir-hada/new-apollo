import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

import { apiRequest } from "./client"
import type { AdminUserListItem } from "./auth-types"
import {
  normalizePlanProductType,
  type AdminPlanListItem,
  type CreatePlanRequest,
  type UpdatePlanRequest,
} from "./plan-types"
import type { AdminSiteListItem } from "./site-types"
import type {
  PlatformSmsSettings,
  UpdatePlatformSmsSettingsRequest,
} from "./sms-settings-types"

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
    productType: normalizePlanProductType(plan.productType),
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

  async getSites() {
    const sites = await apiRequest<AdminSiteListItem[]>("/api/admin/sites", {
      auth: true,
    })

    return sites.map((site) => ({
      ...site,
      productType: normalizePlanProductType(site.productType),
      isActive: site.isActive !== false,
    }))
  },

  setSiteStatus(platformId: string, isActive: boolean) {
    return apiRequest<{ message: string }>(
      `/api/admin/sites/${platformId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
        auth: true,
      }
    )
  },

  deleteSite(platformId: string) {
    return apiRequest<{ message: string }>(`/api/admin/sites/${platformId}`, {
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

  getSmsSettings() {
    return apiRequest<PlatformSmsSettings>("/api/admin/sms-settings", {
      auth: true,
    })
  },

  updateSmsSettings(request: UpdatePlatformSmsSettingsRequest) {
    return apiRequest<PlatformSmsSettings>("/api/admin/sms-settings", {
      method: "PUT",
      body: JSON.stringify(request),
      auth: true,
    })
  },
}
