"use client";

import { useEffect, useState } from "react";
import {
  AppWindow,
  Bell,
  CreditCard,
  Database,
  CircleDot,
  Images,
  KeyRound,
  LayoutTemplate,
  Mail,
  MessageSquareText,
  Monitor,
  Palette,
  Store,
  Truck,
  UserCog,
  UsersRound,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppearanceForm } from "@/features/admin/settings/appearance-form";
import { ApplicationForm } from "@/features/admin/settings/application-form";
import { DisplayForm } from "@/features/admin/settings/display-form";
import { EmailForm } from "@/features/admin/settings/email-form";
import { HeroBannersForm } from "@/features/admin/settings/hero-banners-form";
import { HomeStoriesForm } from "@/features/admin/settings/home-stories-form";
import { LogisticsForm } from "@/features/admin/settings/logistics-form";
import { NotificationsForm } from "@/features/admin/settings/notifications-form";
import { PaymentForm } from "@/features/admin/settings/payment-form";
import { PermissionsForm } from "@/features/admin/settings/permissions-form";
import { ProfileForm } from "@/features/admin/settings/profile-form";
import { RolesForm } from "@/features/admin/settings/roles-form";
import { SmsForm } from "@/features/admin/settings/sms-form";
import { StoreForm } from "@/features/admin/settings/store-form";
import { TemplatesForm } from "@/features/admin/settings/templates-form";
import { TestDataForm } from "@/features/admin/settings/test-data-form";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "profile",
    title: "پروفایل",
    desc: "اطلاعات حساب و رمز عبور.",
    icon: UserCog,
  },
  {
    id: "store",
    title: "فروشگاه",
    desc: "اطلاعات و برندینگ فروشگاه.",
    icon: Store,
  },
  {
    id: "hero-banners",
    title: "بنرهای هیرو",
    desc: "مدیریت اسلایدر تصاویر صفحه اصلی.",
    icon: Images,
  },
  {
    id: "home-stories",
    title: "استوری‌ها",
    desc: "دایره‌های استوری زیر بنر صفحه اصلی.",
    icon: CircleDot,
  },
  {
    id: "test-data",
    title: "داده‌های تستی",
    desc: "تولید و پاک‌سازی محصولات، برندها، دسته‌ها و بلاگ نمونه.",
    icon: Database,
  },
  {
    id: "appearance",
    title: "ظاهری",
    desc: "تم، فونت و رنگ اصلی فروشگاه.",
    icon: Palette,
  },
  {
    id: "templates",
    title: "قالب‌ها",
    desc: "ویرایش قالب نمایش سایت اصلی.",
    icon: LayoutTemplate,
  },
  {
    id: "payment",
    title: "پرداخت",
    desc: "درگاه و پیام‌های پرداخت.",
    icon: CreditCard,
  },
  {
    id: "logistics",
    title: "لجستیک",
    desc: "روش ارسال، هزینه و زمان تحویل.",
    icon: Truck,
  },
  {
    id: "sms",
    title: "پنل پیامکی",
    desc: "روشن/خاموش کردن OTP و پیامک سفارش.",
    icon: MessageSquareText,
  },
  {
    id: "email",
    title: "ایمیل",
    desc: "سرویس ارسال ایمیل و SMTP.",
    icon: Mail,
  },
  {
    id: "roles",
    title: "نقش‌ها",
    desc: "عناوین و نقش‌های کاربران.",
    icon: UsersRound,
  },
  {
    id: "permissions",
    title: "دسترسی‌ها",
    desc: "مجوزهای مدیریتی پنل.",
    icon: KeyRound,
  },
  {
    id: "application",
    title: "اپلیکیشن",
    desc: "تنظیمات کلی اپلیکیشن.",
    icon: AppWindow,
  },
  {
    id: "notifications",
    title: "اعلان‌ها",
    desc: "پیام‌ها و ایمیل‌های اطلاع‌رسانی.",
    icon: Bell,
  },
  {
    id: "display",
    title: "نمایش",
    desc: "موارد قابل‌نمایش در سایدبار.",
    icon: Monitor,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(v: string | null): v is TabId {
  return !!v && TABS.some((t) => t.id === v);
}

function readTabFromLocation(): TabId {
  if (typeof window === "undefined") return "profile";
  const raw = new URLSearchParams(window.location.search).get("tab");
  if (raw === "account" || raw === "security") return "profile";
  return isTabId(raw) ? raw : "profile";
}

function setTabInUrl(id: TabId) {
  const url = `/admin/settings?tab=${id}`;
  window.history.replaceState(
    { ...window.history.state, as: url, url },
    "",
    url,
  );
}

export function AdminSettings() {
  const [tab, setTab] = useState<TabId>("profile");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readTabFromLocation();
    setTab(initial);
    if (
      typeof window !== "undefined" &&
      !window.location.search.includes(`tab=${initial}`)
    ) {
      setTabInUrl(initial);
    }
    setReady(true);

    const onPopState = () => setTab(readTabFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function selectTab(id: TabId) {
    if (id === tab) return;
    setTab(id);
    setTabInUrl(id);
  }

  const active = TABS.find((t) => t.id === tab)!;

  if (!ready) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] w-full">
      <aside className="relative sticky top-16 z-10 hidden h-[calc(100svh-4rem)] w-[180px] shrink-0 self-start overflow-hidden border-s border-border lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-[color-mix(in_oklab,var(--primary)_9%,var(--background))] dark:bg-[color-mix(in_oklab,var(--primary)_18%,var(--background))]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 end-0 w-0.5 bg-primary/40 dark:bg-primary/70"
        />
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full text-primary opacity-[0.12] dark:opacity-[0.28]"
        >
          <defs>
            <pattern
              id="settings-nav-pattern"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="3" r="1.35" fill="currentColor" />
              <path
                d="M14 0v8M0 14h8"
                stroke="currentColor"
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity="0.7"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#settings-nav-pattern)" />
        </svg>
        <nav
          aria-label="بخش‌های تنظیمات"
          className="relative z-10 flex h-full flex-col gap-0.5 overflow-y-auto border-s border-border/70 py-2 dark:border-primary/25"
        >
          {TABS.map((item) => {
            const Icon = item.icon;
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-s-2 px-3 py-2 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary/12 font-medium text-primary dark:bg-primary/20"
                    : "border-transparent text-muted-foreground hover:bg-primary/8 hover:text-foreground dark:hover:bg-primary/12",
                )}
              >
                <Icon className="size-4 shrink-0 text-primary" />
                {item.title}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-5">
        <div className="mb-4 lg:hidden">
          <label htmlFor="settings-tab" className="sr-only">
            بخش تنظیمات
          </label>
          <Select value={tab} onValueChange={(v) => v && isTabId(v) && selectTab(v)}>
            <SelectTrigger id="settings-tab" className="h-11 w-full min-w-0 justify-between">
              <SelectValue placeholder="انتخاب بخش">
                {TABS.find((t) => t.id === tab)?.title}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TABS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div key={tab} className="animate-tab-enter">
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">{active.title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{active.desc}</p>
          </div>

          {tab === "profile" && <ProfileForm />}
          {tab === "store" && <StoreForm />}
          {tab === "hero-banners" && <HeroBannersForm />}
          {tab === "home-stories" && <HomeStoriesForm />}
          {tab === "test-data" && <TestDataForm />}
          {tab === "appearance" && <AppearanceForm />}
          {tab === "templates" && <TemplatesForm />}
          {tab === "payment" && <PaymentForm />}
          {tab === "logistics" && <LogisticsForm />}
          {tab === "sms" && <SmsForm />}
          {tab === "email" && <EmailForm />}
          {tab === "roles" && <RolesForm />}
          {tab === "permissions" && <PermissionsForm />}
          {tab === "application" && <ApplicationForm />}
          {tab === "notifications" && <NotificationsForm />}
          {tab === "display" && <DisplayForm />}
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsFallback() {
  return <Skeleton className="h-40 w-full rounded-xl" />;
}
