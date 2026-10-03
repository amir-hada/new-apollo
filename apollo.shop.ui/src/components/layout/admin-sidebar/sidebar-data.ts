import {
  AudioWaveform,
  Award,
  Command,
  FileText,
  FolderTree,
  GalleryVerticalEnd,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
  Warehouse,
} from "lucide-react";
import type { SidebarData } from "./types";

export const sidebarData: SidebarData = {
  teams: [
    {
      name: "فروشگاه آپولو",
      logo: Command,
      plan: "پنل مدیریت",
    },
    {
      name: "آپولو شاپ",
      logo: GalleryVerticalEnd,
      plan: "سازمانی",
    },
    {
      name: "فروشگاه آزمایشی",
      logo: AudioWaveform,
      plan: "استارتاپ",
    },
  ],
  navGroups: [
    {
      title: "",
      items: [
        {
          title: "داشبورد",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "قابلیت‌ها",
          url: "/admin/apps",
          icon: Package,
        },
        {
          title: "پشتیبانی",
          url: "/admin/chats",
          badge: "۳",
          icon: MessagesSquare,
        },
        {
          title: "کاربران",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "فروشگاه",
          icon: Store,
          defaultOpen: true,
          items: [
            { title: "محصولات", url: "/admin/products", icon: Package },
            { title: "دسته‌بندی‌ها", url: "/admin/categories", icon: FolderTree },
            { title: "برندها", url: "/admin/brands", icon: Award },
            { title: "انبار", url: "/admin/inventory", icon: Warehouse },
            { title: "کد تخفیف", url: "/admin/coupons", icon: Tag },
            { title: "سفارش‌ها", url: "/admin/orders", icon: ShoppingBag },
            { title: "گزارش‌ها", url: "/admin/reports", icon: LayoutDashboard },
          ],
        },
        {
          title: "محتوا",
          icon: FileText,
          items: [
            { title: "بلاگ", url: "/admin/blog", icon: FileText },
            { title: "تیکت‌ها", url: "/admin/tickets", icon: MessagesSquare },
          ],
        },
        {
          title: "تنظیمات",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
};
