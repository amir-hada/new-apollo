"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  Shield,
  UserRound,
} from "lucide-react";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "@/features/admin/chats/data/chat-types";
import type { OrderListItem, PagedResult, Profile } from "@/types/api";

const navItems = [
  { href: "/account", label: "خلاصه فعالیت‌ها", shortLabel: "خلاصه", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "سفارش‌ها", shortLabel: "سفارش‌ها", icon: Package },
  { href: "/account/addresses", label: "آدرس‌ها", shortLabel: "آدرس‌ها", icon: MapPin },
  { href: "/account/messages", label: "پیام‌ها و پشتیبانی", shortLabel: "پیام‌ها", icon: MessageSquare, badgeKey: "messages" as const },
  { href: "/account/profile", label: "اطلاعات حساب کاربری", shortLabel: "حساب", icon: UserRound },
  { href: "/account/security", label: "امنیت و رمز عبور", shortLabel: "امنیت", icon: Shield },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<Profile>("/api/account/profile")).data,
  });

  const orders = useQuery({
    queryKey: ["my-orders-summary"],
    queryFn: async () =>
      (await api.get<PagedResult<OrderListItem>>("/api/orders", { params: { page: 1, pageSize: 100 } }))
        .data,
  });

  const chats = useQuery({
    queryKey: ["my-support-conversations"],
    queryFn: async () =>
      (await api.get<ChatConversation[]>("/api/chats/conversations")).data,
    retry: false,
  });

  const displayName =
    [profile.data?.firstName ?? user?.firstName, profile.data?.lastName ?? user?.lastName]
      .filter(Boolean)
      .join(" ") || "کاربر فروشگاه";

  const phone =
    profile.data?.phoneNumber || user?.phoneNumber || profile.data?.email || user?.email || "—";

  const orderCount = orders.data?.totalCount ?? 0;
  const deliveredCount =
    orders.data?.items.filter((o) => o.status === 4).length ?? 0;
  const unreadMessages =
    chats.data?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0;

  return (
    <aside className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-foreground">{displayName}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground" dir="ltr">
              {toPersianDigits(String(phone))}
            </p>
          </div>
          <Link
            href="/account/profile"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10"
            aria-label="ویرایش اطلاعات حساب"
          >
            <Pencil className="size-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm lg:block lg:space-y-3">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-2 py-2 lg:flex-row lg:justify-between lg:bg-transparent lg:px-0 lg:py-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground lg:gap-2 lg:text-sm">
              <Package className="size-3.5 text-primary lg:size-4" />
              سفارش‌ها
            </span>
            <span className="font-medium tabular-nums">
              {toPersianDigits(String(orderCount))}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-2 py-2 lg:flex-row lg:justify-between lg:bg-transparent lg:px-0 lg:py-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground lg:gap-2 lg:text-sm">
              <Heart className="size-3.5 text-primary lg:size-4" />
              تحویل‌شده
            </span>
            <span className="font-medium tabular-nums">
              {toPersianDigits(String(deliveredCount))}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-2 py-2 lg:flex-row lg:justify-between lg:bg-transparent lg:px-0 lg:py-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground lg:gap-2 lg:text-sm">
              <MessageSquare className="size-3.5 text-primary lg:size-4" />
              پیام‌ها
            </span>
            {unreadMessages > 0 ? (
              <Link href="/account/messages" className="text-[11px] font-medium text-primary hover:underline lg:text-sm">
                {toPersianDigits(String(unreadMessages))}
              </Link>
            ) : (
              <Link href="/account/messages" className="text-[11px] text-primary hover:underline lg:text-sm">
                —
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* موبایل/تبلت: ناوبری افقی */}
      <nav
        className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"
        aria-label="منوی حساب کاربری"
      >
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showBadge = item.badgeKey === "messages" && unreadMessages > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative inline-flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] transition-colors",
                active
                  ? "bg-muted/70 font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", active ? "text-primary" : "")} />
              <span>{item.shortLabel}</span>
              {showBadge ? (
                <span className="absolute end-1 top-1 size-1.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          className="inline-flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] text-destructive hover:bg-destructive/5"
          onClick={() => {
            clearSession();
            router.push("/");
          }}
        >
          <LogOut className="size-4" />
          <span>خروج</span>
        </button>
      </nav>

      {/* دسکتاپ: ناوبری عمودی */}
      <nav className="hidden py-1 lg:block">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showBadge = item.badgeKey === "messages" && unreadMessages > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-b border-border/70 px-4 py-3.5 text-sm transition-colors last:border-b-0",
                active
                  ? "bg-muted/60 font-semibold text-foreground"
                  : "text-foreground/90 hover:bg-muted/40",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {toPersianDigits(String(unreadMessages))}
                </span>
              ) : null}
            </Link>
          );
        })}

        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-destructive transition-colors hover:bg-destructive/5"
          onClick={() => {
            clearSession();
            router.push("/");
          }}
        >
          <LogOut className="size-[18px] shrink-0" />
          <span className="flex-1 text-start">خروج از حساب کاربری</span>
        </button>
      </nav>
    </aside>
  );
}
