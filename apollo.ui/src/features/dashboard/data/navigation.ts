import {
  BotIcon,
  HeadphonesIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LayersIcon,
  SettingsIcon,
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
    description: "نمای کلی فعالیت‌ها",
  },
  {
    title: "پلتفرم‌ها",
    href: "/dashboard/platforms",
    icon: LayersIcon,
    description: "مدیریت پلتفرم‌های شما",
  },
  {
    title: "دستیار هوشمند",
    href: "/dashboard/assistant",
    icon: BotIcon,
    description: "گفتگو و پرامپت روی پلتفرم",
  },
  {
    title: "صندوق پیام",
    href: "/dashboard/messages",
    icon: InboxIcon,
    description: "تمام پیام‌ها و اعلان‌ها",
  },
  {
    title: "پشتیبانی",
    href: "/dashboard/support",
    icon: HeadphonesIcon,
    description: "ارتباط با تیم پشتیبانی",
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
  "/dashboard/platforms": "پلتفرم‌ها",
  "/dashboard/assistant": "دستیار هوشمند",
  "/dashboard/messages": "صندوق پیام",
  "/dashboard/support": "پشتیبانی",
  "/dashboard/settings": "تنظیمات",
}

export function resolveDashboardPageTitle(pathname: string) {
  if (dashboardPageTitles[pathname]) {
    return dashboardPageTitles[pathname]
  }

  if (pathname.startsWith("/dashboard/platforms/")) {
    return "جزئیات پلتفرم"
  }

  return "داشبورد"
}
