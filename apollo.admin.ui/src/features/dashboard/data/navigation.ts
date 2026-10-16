import {
  GlobeIcon,
  HeadphonesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
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
    title: "سایت‌ها",
    href: "/dashboard/sites",
    icon: GlobeIcon,
    description: "سایت‌های ساخته‌شده کاربران",
  },
  {
    title: "پشتیبانی",
    href: "/dashboard/support",
    icon: HeadphonesIcon,
    description: "ارتباط با پشتیبانی",
  },
  {
    title: "پنل پیامکی",
    href: "/dashboard/sms-panel",
    icon: MessageSquareTextIcon,
    description: "تنظیمات مشترک SMS.ir",
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
  "/dashboard/sites": "سایت‌ها",
  "/dashboard/support": "پشتیبانی",
  "/dashboard/sms-panel": "پنل پیامکی",
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
