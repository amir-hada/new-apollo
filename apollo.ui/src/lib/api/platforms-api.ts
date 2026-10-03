import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

import { apiRequest } from "./client"
import type {
  CreateUserPlatformRequest,
  PlanOption,
  PlatformSettings,
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
  }
}

function normalizePlatformDetail(detail: UserPlatformDetail): UserPlatformDetail {
  return {
    ...detail,
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
    return apiRequest<UserPlatformListItem[]>("/api/platforms", {
      auth: true,
    })
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

  deletePlatform(platformId: string) {
    return apiRequest<{ message: string }>(`/api/platforms/${platformId}`, {
      method: "DELETE",
      auth: true,
    })
  },
}
