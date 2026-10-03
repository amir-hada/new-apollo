import {
  HeadphonesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type DashboardNavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    description: "نمای کلی پنل مدیریت",
  },
  {
    title: "کاربران",
    href: "/dashboard/users",
    icon: UsersIcon,
    description: "مدیریت کاربران",
  },
  {
    title: "پلن‌ها",
    href: "/dashboard/plans",
    icon: LayersIcon,
    description: "مدیریت پلن‌های اشتراک",
  },
  {
    title: "پشتیبانی",
    href: "/dashboard/support",
    icon: HeadphonesIcon,
    description: "ارتباط با پشتیبانی",
  },
  {
    title: "تنظیمات",
    href: "/dashboard/settings",
    icon: SettingsIcon,
    description: "اطلاعات حساب کاربری",
  },
]

export const dashboardPageTitles: Record<string, string> = {
  "/dashboard": "داشبورد",
  "/dashboard/users": "کاربران",
  "/dashboard/plans": "پلن‌ها",
  "/dashboard/support": "پشتیبانی",
  "/dashboard/settings": "تنظیمات",
}

export function resolveDashboardPageTitle(pathname: string) {
  if (dashboardPageTitles[pathname]) {
    return dashboardPageTitles[pathname]
  }

  if (pathname.startsWith("/dashboard/plans/")) {
    return "جزئیات پلن"
  }

  return "داشبورد"
}
