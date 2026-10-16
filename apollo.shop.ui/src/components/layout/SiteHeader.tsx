"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Baby,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  Coins,
  CreditCard,
  Dumbbell,
  Gem,
  Gift,
  Heart,
  Home,
  Laptop,
  Menu,
  Package,
  Percent,
  Ruler,
  Shield,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Truck,
  User,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NavbarSearch } from "@/features/search/NavbarSearch";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useShopSettings } from "@/lib/shop-settings-api";
import {
  getShopIndustryPreset,
  type ShopNavIconKey,
} from "@/lib/shop-industry-presets";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { cn } from "@/lib/utils";
import type { Cart, CategoryTree } from "@/types/api";

const NAV_ICONS: Record<ShopNavIconKey, LucideIcon> = {
  briefcase: Briefcase,
  gift: Gift,
  package: Package,
  creditCard: CreditCard,
  coins: Coins,
  shirt: Shirt,
  ruler: Ruler,
  percent: Percent,
  sparkles: Sparkles,
  smartphone: Smartphone,
  shield: Shield,
  truck: Truck,
  bookOpen: BookOpen,
  utensils: Utensils,
  baby: Baby,
  laptop: Laptop,
  gem: Gem,
  dumbbell: Dumbbell,
  home: Home,
  heart: Heart,
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const catsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const logoWrapRef = useRef<HTMLDivElement | null>(null);
  const navRowRef = useRef<HTMLDivElement | null>(null);
  const [searchWidth, setSearchWidth] = useState<number | null>(null);
  const [navClusterWidth, setNavClusterWidth] = useState<number | null>(null);

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.phoneNumber ||
    user?.email?.split("@")[0] ||
    "حساب من";
  const cart = useCartStore((s) => s.cart);
  const setCart = useCartStore((s) => s.setCart);
  const { settings } = useSiteSettings();
  const { data: shopSettings } = useShopSettings();
  const nav = settings.navbar;
  const brandName = shopSettings?.shopTitle || nav.brandName;
  const logoUrl = shopSettings?.logoUrl;
  const industryPreset = useMemo(
    () => getShopIndustryPreset(shopSettings?.industryKey),
    [shopSettings?.industryKey],
  );
  const bottomNav = industryPreset.headerNav;
  const categoryIcons = useMemo(
    () =>
      industryPreset.categoryIcons.map(
        (key) => NAV_ICONS[key] ?? Package,
      ),
    [industryPreset.categoryIcons],
  );

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<Cart>("/api/cart")).data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => (await api.get<CategoryTree[]>("/api/categories/tree")).data,
  });

  useEffect(() => {
    if (cartData) setCart(cartData);
  }, [cartData, setCart]);

  useEffect(() => {
    setMobileOpen(false);
    setCatsOpen(false);
    setMobileCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !catsRef.current?.contains(target) &&
        !megaMenuRef.current?.contains(target)
      ) {
        setCatsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!catsOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCatsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [catsOpen]);

  useEffect(() => {
    if (categories.length === 0) return;
    setActiveCatId((prev) =>
      prev && categories.some((c) => c.id === prev) ? prev : categories[0].id,
    );
  }, [categories]);

  useEffect(() => {
    return () => {
      if (catsCloseTimer.current) clearTimeout(catsCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${el.offsetHeight}px`,
      );
    };

    syncHeaderHeight();
    const ro = new ResizeObserver(syncHeaderHeight);
    ro.observe(el);
    window.addEventListener("resize", syncHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, []);

  useLayoutEffect(() => {
    const navEl = navRowRef.current;
    const logoEl = logoWrapRef.current;
    if (!navEl || !logoEl) return;

    const syncClusterWidths = () => {
      const gap = 16;
      const cluster = navEl.offsetWidth;
      setNavClusterWidth(cluster);
      setSearchWidth(Math.max(220, cluster - logoEl.offsetWidth - gap));
    };

    syncClusterWidths();
    const ro = new ResizeObserver(syncClusterWidths);
    ro.observe(navEl);
    ro.observe(logoEl);
    return () => ro.disconnect();
  }, [nav.showCategories, categories.length]);

  const itemCount = cart?.itemCount ?? 0;

  const logoBlock = (
    <Link
      href="/"
      className="inline-flex min-w-0 max-w-[42vw] items-center gap-2 text-lg font-extrabold tracking-tight text-[#3f4064] dark:text-foreground sm:max-w-[220px] sm:text-xl lg:max-w-none lg:shrink-0"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={brandName}
          className="h-9 w-auto max-w-full object-contain"
        />
      ) : (
        <span className="truncate">{brandName}</span>
      )}
    </Link>
  );

  const searchForm = nav.showSearch ? (
    <NavbarSearch
      style={searchWidth ? { width: searchWidth } : { width: "28rem" }}
    />
  ) : null;

  const accountButton = !hydrated ? (
    <div
      className="h-11 w-[7.5rem] shrink-0 animate-pulse rounded-md bg-[#f0f0f1] dark:bg-muted"
      aria-hidden
    />
  ) : user ? (
    <button
      type="button"
      onClick={() => router.push("/account")}
      className="inline-flex h-11 max-w-[7.5rem] items-center gap-1.5 rounded-md border border-[#e0e0e2] bg-background px-2.5 text-[13px] font-medium text-[#3f4064] transition hover:bg-muted sm:max-w-[11rem] sm:gap-2 sm:px-3 dark:border-white/10 dark:text-foreground"
      title={displayName}
    >
      <User className="size-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{displayName}</span>
    </button>
  ) : (
    <Link
      href="/login"
      className="inline-flex h-11 items-center rounded-md border border-[#e0e0e2] bg-background px-2.5 text-[13px] font-medium text-[#3f4064] transition hover:bg-muted sm:px-3.5 dark:border-white/10 dark:text-foreground"
      aria-label="ورود یا ثبت نام"
    >
      <span className="sm:hidden">ورود</span>
      <span className="hidden sm:inline">
        ورود
        <span className="mx-1.5 text-[#a1a3a8]">|</span>
        ثبت نام
      </span>
    </Link>
  );

  const actionsBlock = (
    <div className="flex shrink-0 items-center gap-2">
      <ThemeToggle />
      {accountButton}

      {nav.showCart ? (
        <Link
          href="/cart"
          className="relative inline-flex size-11 items-center justify-center rounded-md border border-[#e0e0e2] bg-background text-[#3f4064] transition hover:bg-muted dark:border-white/10 dark:text-foreground"
          aria-label="سبد خرید"
        >
          <ShoppingCart className="size-[18px]" strokeWidth={1.75} />
          {itemCount > 0 ? (
            <span className="absolute -top-1 -start-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {toPersianDigits(String(itemCount))}
            </span>
          ) : null}
        </Link>
      ) : null}
    </div>
  );

  const openCatsMenu = () => {
    if (catsCloseTimer.current) {
      clearTimeout(catsCloseTimer.current);
      catsCloseTimer.current = null;
    }
    if (categories[0] && !activeCatId) setActiveCatId(categories[0].id);
    setCatsOpen(true);
  };

  const scheduleCloseCatsMenu = () => {
    if (catsCloseTimer.current) clearTimeout(catsCloseTimer.current);
    catsCloseTimer.current = setTimeout(() => setCatsOpen(false), 160);
  };

  const activeCategory =
    categories.find((c) => c.id === activeCatId) ?? categories[0] ?? null;

  const categoriesTrigger = (
    <div
      ref={catsRef}
      onMouseEnter={openCatsMenu}
      onMouseLeave={scheduleCloseCatsMenu}
    >
      <button
        type="button"
        onClick={() => setCatsOpen((v) => !v)}
        className={cn(
          "relative inline-flex h-9 items-center gap-2 px-1 text-[13px] font-bold text-[#3f4064] transition dark:text-foreground",
          catsOpen && "text-primary",
        )}
      >
        {catsOpen ? (
          <X className="size-[18px]" strokeWidth={2} />
        ) : (
          <Menu className="size-[18px]" strokeWidth={2} />
        )}
        دسته‌بندی محصولات
        {catsOpen ? (
          <span className="absolute inset-x-0 -bottom-2.5 h-0.5 bg-primary" />
        ) : null}
      </button>
    </div>
  );

  const categoriesMegaMenu =
    catsOpen && nav.showCategories ? (
      <>
        <div
          className="fixed inset-x-0 bottom-0 z-40 hidden bg-black/40 lg:block"
          style={{ top: "var(--site-header-height, 7.5rem)" }}
          onClick={() => setCatsOpen(false)}
          aria-hidden
        />
        <div className="absolute inset-x-0 top-full z-50 hidden px-3 sm:px-4 lg:block">
          <div
            ref={megaMenuRef}
            className="flex h-[min(72vh,520px)] max-w-full overflow-hidden rounded-b-md border border-t-0 border-[#e0e0e2] bg-background shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:border-white/10"
            style={{ width: navClusterWidth ?? undefined }}
            onMouseEnter={openCatsMenu}
            onMouseLeave={scheduleCloseCatsMenu}
          >
            {/* سایدبار دسته‌های اصلی (سمت راست در RTL) */}
            <aside className="flex w-[200px] shrink-0 flex-col overflow-y-auto border-e border-[#e0e0e2] bg-[#f5f5f5] dark:border-white/10 dark:bg-muted/40">
              {categories.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  دسته‌بندی‌ای ثبت نشده است
                </p>
              ) : (
                categories.map((cat, index) => {
                  const Icon = categoryIcons[index % categoryIcons.length];
                  const active = activeCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setActiveCatId(cat.id)}
                      onFocus={() => setActiveCatId(cat.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 border-s-[3px] px-3 py-3 text-start text-[13px] transition",
                        active
                          ? "border-primary bg-background font-bold text-primary"
                          : "border-transparent text-[#3f4064] hover:bg-background/70 dark:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active ? "text-primary" : "text-[#81858b]",
                        )}
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })
              )}
            </aside>

            {/* محتوای زیرمجموعه‌ها */}
            <div className="min-w-0 flex-1 overflow-y-auto bg-background px-6 py-5">
              {activeCategory ? (
                <>
                  <Link
                    href={`/categories/${activeCategory.slug}`}
                    onClick={() => setCatsOpen(false)}
                    className="mb-5 inline-flex items-center gap-1 text-[13px] font-medium text-[#19bfd3] transition hover:text-primary"
                  >
                    همه محصولات {activeCategory.name}
                    <ChevronLeft className="size-3.5" strokeWidth={2.25} />
                  </Link>

                  {activeCategory.children?.length ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-6 xl:grid-cols-3">
                      {activeCategory.children.map((child) => (
                        <div key={child.id} className="min-w-0">
                          <Link
                            href={`/categories/${child.slug}`}
                            onClick={() => setCatsOpen(false)}
                            className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-[#3f4064] transition hover:text-primary dark:text-foreground"
                          >
                            <span className="h-3.5 w-0.5 shrink-0 rounded-full bg-primary" />
                            <span className="truncate">{child.name}</span>
                            <ChevronLeft
                              className="size-3 shrink-0 text-[#a1a3a8]"
                              strokeWidth={2.25}
                            />
                          </Link>
                          {child.children?.length ? (
                            <ul className="space-y-0.5">
                              {child.children.map((grand) => (
                                <li key={grand.id}>
                                  <Link
                                    href={`/categories/${grand.slug}`}
                                    onClick={() => setCatsOpen(false)}
                                    className="block truncate py-1 text-[12px] text-[#81858b] transition hover:text-primary"
                                  >
                                    {grand.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      زیرمجموعه‌ای برای این دسته ثبت نشده است.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  دسته‌بندی‌ای برای نمایش وجود ندارد.
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    ) : null;

  const bottomNavLinks = (
    <nav className="flex items-center gap-1">
      {bottomNav.map((item) => {
        const Icon = NAV_ICONS[item.icon] ?? Package;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-[#3f4064] transition hover:bg-muted dark:text-foreground"
          >
            <Icon className="size-4 text-[#81858b]" strokeWidth={1.75} />
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header
      ref={headerRef}
      className="relative sticky top-0 z-50 border-b border-[#e0e0e2] bg-background dark:border-white/10"
    >
      {/* موبایل / تبلت */}
      <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 lg:hidden">
        <button
          type="button"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-muted"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="منو"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        {logoBlock}
        <div className="ms-auto min-w-0">{actionsBlock}</div>
      </div>

      {/* دسکتاپ: لبهٔ چپ سرچ با لبهٔ آخرین دکمه نوبار یکی می‌شود */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between gap-6 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-4">
            <div ref={logoWrapRef}>{logoBlock}</div>
            {searchForm}
          </div>
          {actionsBlock}
        </div>

        {nav.showCategories ? (
          <div className="flex items-center gap-6 border-t border-[#e0e0e2] px-3 py-2.5 sm:px-4 dark:border-white/10">
            <div ref={navRowRef} className="flex w-max items-center gap-1">
              {categoriesTrigger}
              <div className="mx-2 h-4 w-px shrink-0 bg-[#e0e0e2] dark:bg-white/10" />
              {bottomNavLinks}
            </div>
          </div>
        ) : null}
      </div>

      {categoriesMegaMenu}

      {/* پنل موبایل */}
      {mobileOpen ? (
        <div className="border-t border-[#e0e0e2] bg-background px-3 py-4 lg:hidden dark:border-white/10">
          {nav.showSearch ? (
            <div className="mb-4">
              <NavbarSearch onNavigate={() => setMobileOpen(false)} />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileCatsOpen((v) => !v)}
            className="mb-2 flex w-full items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5 text-sm font-bold text-[#3f4064] dark:text-foreground"
          >
            <span className="inline-flex items-center gap-2">
              <Menu className="size-4" />
              دسته‌بندی محصولات
            </span>
            <ChevronDown
              className={cn(
                "size-4 transition",
                mobileCatsOpen && "rotate-180",
              )}
            />
          </button>

          {mobileCatsOpen ? (
            <div className="mb-3 space-y-1 rounded-xl border border-[#e0e0e2] p-2 dark:border-white/10">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    {cat.name}
                  </Link>
                  {cat.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="block rounded-lg px-5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          <nav className="flex flex-col gap-0.5">
            {bottomNav.map((item) => {
              const Icon = NAV_ICONS[item.icon] ?? Package;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <Icon className="size-4 text-[#81858b]" />
                  {item.label}
                  {item.badge ? (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <User className="size-4 shrink-0 text-[#81858b]" />
                  {displayName}
                </Link>
                {isAdmin() ? (
                  <Link
                    href="/admin"
                    className="rounded-md px-3 py-2.5 text-sm hover:bg-muted"
                  >
                    پنل ادمین
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="rounded-md px-3 py-2.5 text-start text-sm text-destructive hover:bg-muted"
                  onClick={() => {
                    clearSession();
                    router.push("/");
                  }}
                >
                  خروج
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-md border border-[#e0e0e2] px-3 py-2.5 text-sm font-medium dark:border-white/10"
              >
                <User className="size-4 text-[#81858b]" />
                ورود | ثبت نام
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
