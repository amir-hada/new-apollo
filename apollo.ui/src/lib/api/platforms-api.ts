import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

import { apiRequest } from "./client"
import type {
  CreateUserPlatformRequest,
  PlanOption,
  PlatformSettings,
  ShopSsoRedirect,
  UpdatePlatformSettingsRequest,
  UserPlatformDetail,
  UserPlatformListItem,
} from "./platform-types"

function normalizePlanOption(option: PlanOption): PlanOption {
  return {
    ...option,
    imageUrl: sanitizeProtectedFileUrl(option.imageUrl),
  }
}

function normalizeSettings(settings: PlatformSettings | null | undefined): PlatformSettings {
  return {
    websiteName: settings?.websiteName ?? "",
    websiteLogoFileId: settings?.websiteLogoFileId ?? "",
    websiteLogoUrl: sanitizeProtectedFileUrl(settings?.websiteLogoUrl ?? null),
    adminUsername: settings?.adminUsername ?? "",
    adminPassword: settings?.adminPassword ?? "",
    templateCode: settings?.templateCode ?? "",
    slug: settings?.slug ?? null,
  }
}

function normalizeListItem(item: UserPlatformListItem): UserPlatformListItem {
  return {
    ...item,
    productType: item.productType ?? "Shop",
    tenantId: item.tenantId ?? null,
    tenantSlug: item.tenantSlug ?? null,
    storefrontUrl: item.storefrontUrl ?? null,
    adminUrl: item.adminUrl ?? null,
    provisioningStatus: item.provisioningStatus ?? "Pending",
    provisioningError: item.provisioningError ?? null,
  }
}

function normalizePlatformDetail(detail: UserPlatformDetail): UserPlatformDetail {
  return {
    ...detail,
    productType: detail.productType ?? "Shop",
    tenantId: detail.tenantId ?? null,
    tenantSlug: detail.tenantSlug ?? detail.settings?.slug ?? null,
    storefrontUrl: detail.storefrontUrl ?? null,
    adminUrl: detail.adminUrl ?? null,
    provisioningStatus: detail.provisioningStatus ?? "Pending",
    provisioningError: detail.provisioningError ?? null,
    settings: normalizeSettings(detail.settings),
    availableTemplates: (detail.availableTemplates ?? []).map((template) => ({
      code: template.code ?? "",
      title: template.title ?? "",
      imageUrl: sanitizeProtectedFileUrl(template.imageUrl),
    })),
  }
}

export const platformsApi = {
  async getPlatforms() {
    const items = await apiRequest<UserPlatformListItem[]>("/api/platforms", {
      auth: true,
    })

    return items.map(normalizeListItem)
  },

  async getPlatform(platformId: string) {
    const detail = await apiRequest<UserPlatformDetail>(
      `/api/platforms/${platformId}`,
      {
        auth: true,
      }
    )

    return normalizePlatformDetail(detail)
  },

  async getPlanOptions() {
    const options = await apiRequest<PlanOption[]>(
      "/api/platforms/plan-options",
      { auth: true }
    )

    return options.map(normalizePlanOption)
  },

  createPlatform(request: CreateUserPlatformRequest) {
    return apiRequest<UserPlatformListItem>("/api/platforms", {
      method: "POST",
      body: JSON.stringify(request),
      auth: true,
    })
  },

  async updatePlatformSettings(
    platformId: string,
    request: UpdatePlatformSettingsRequest
  ) {
    const detail = await apiRequest<UserPlatformDetail>(
      `/api/platforms/${platformId}/settings`,
      {
        method: "PUT",
        body: JSON.stringify(request),
        auth: true,
      }
    )

    return normalizePlatformDetail(detail)
  },

  async retryProvisioning(platformId: string) {
    const detail = await apiRequest<UserPlatformDetail>(
      `/api/platforms/${platformId}/retry-provisioning`,
      {
        method: "POST",
        auth: true,
      }
    )

    return normalizePlatformDetail(detail)
  },

  createShopSso(platformId: string) {
    return apiRequest<ShopSsoRedirect>(`/api/platforms/${platformId}/shop-sso`, {
      method: "POST",
      auth: true,
    })
  },

  deletePlatform(platformId: string) {
    return apiRequest<{ message: string }>(`/api/platforms/${platformId}`, {
      method: "DELETE",
      auth: true,
    })
  },
}
