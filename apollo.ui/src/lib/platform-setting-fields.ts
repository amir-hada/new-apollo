/**
 * Fixed platform setting fields (user UI).
 * Keys match API / PlatformSettings; labels are Persian UI copy.
 */
export const PLATFORM_SETTING_FIELDS = {
  websiteName: {
    key: "websiteName",
    label: "نام وبسایت",
  },
  websiteLogo: {
    key: "websiteLogo",
    label: "لوگو وبسایت",
  },
  adminUsername: {
    key: "adminUsername",
    label: "نام کاربری ادمین",
  },
  adminPassword: {
    key: "adminPassword",
    label: "رمزعبور ادمین",
  },
  siteTemplate: {
    key: "siteTemplate",
    label: "قالب سایت",
  },
} as const

export type PlatformSettingFieldKey =
  (typeof PLATFORM_SETTING_FIELDS)[keyof typeof PLATFORM_SETTING_FIELDS]["key"]
