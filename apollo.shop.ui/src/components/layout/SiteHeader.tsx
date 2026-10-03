"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useShopSettings } from "@/lib/shop-settings-api";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { cn } from "@/lib/utils";
import type { Cart, CategoryTree } from "@/types/api";

const quickLinks = [
  { href: "/products", label: "همه محصولات" },
  { href: "/blog", label: "بلاگ" },
  { href: "/faq", label: "سوالات متداول" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const catsRef = useRef<HTMLDivElement | null>(null);

  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const cart = useCartStore((s) => s.cart);
  const setCart = useCartStore((s) => s.setCart);
  const { settings } = useSiteSettings();
  const { data: shopSettings } = useShopSettings();
  const nav = settings.navbar;
  const brandName = shopSettings?.shopTitle || nav.brandName;
  const logoUrl = shopSettings?.logoUrl;

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
      if (!catsRef.current?.contains(e.target as Node)) {
        setCatsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function submitSearch(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  }

  const itemCount = cart?.itemCount ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-5">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-muted lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="منو"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-primary sm:text-xl"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-8 w-auto max-w-[140px] object-contain" />
          ) : (
            brandName
          )}
        </Link>

        {nav.showSearch && (
        <form
          onSubmit={submitSearch}
          className="relative mx-auto hidden min-w-0 flex-1 md:block"
        >
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در محصولات، برند و دسته‌ها..."
            className="h-11 w-full rounded-2xl border border-border bg-muted/40 pe-24 ps-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
          <button
            type="submit"
            className="absolute end-1.5 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:opacity-90"
          >
            جستجو
          </button>
        </form>
        )}

        <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {nav.showCart && (
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition hover:bg-muted"
            aria-label="سبد خرید"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 end-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                {toPersianDigits(String(itemCount))}
              </span>
            )}
          </Link>
          )}

          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:bg-secondary"
              >
                <User className="h-4 w-4 text-primary" />
                <span className="max-w-[7rem] truncate">{user.firstName || "حساب من"}</span>
              </button>
              {isAdmin() && (
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="inline-flex h-10 items-center rounded-xl bg-secondary px-3 text-xs font-bold text-secondary-foreground"
                >
                  ادمین
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  router.push("/");
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="خروج"
                title="خروج"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-xl border border-primary/20 bg-primary px-3 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition hover:opacity-90 sm:inline-flex"
            >
              ورود
              <span className="mx-1.5 opacity-50">|</span>
              ثبت‌نام
            </Link>
          )}
        </div>
      </div>

      {/* Categories bar */}
      {nav.showCategories && (
      <div className="hidden border-t border-border/60 bg-background/60 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2">
          <div className="relative" ref={catsRef}>
            <button
              type="button"
              onClick={() => setCatsOpen((v) => !v)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition",
                catsOpen
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              دسته‌بندی‌ها
              <ChevronDown className={cn("h-3.5 w-3.5 transition", catsOpen && "rotate-180")} />
            </button>

            {catsOpen && (
              <div className="absolute start-0 top-[calc(100%+0.5rem)] z-50 w-[min(92vw,720px)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10 dark:shadow-black/40">
                <div className="border-b border-border bg-muted/40 px-4 py-3">
                  <p className="text-sm font-bold text-foreground">کاوش در دسته‌ها</p>
                  <p className="text-xs text-muted-foreground">انتخاب سریع دسته‌بندی محصولات</p>
                </div>
                <div className="grid max-h-[420px] gap-1 overflow-y-auto p-3 sm:grid-cols-2 md:grid-cols-3">
                  {categories.length === 0 ? (
                    <p className="col-span-full px-2 py-6 text-center text-sm text-muted-foreground">
                      دسته‌بندی‌ای ثبت نشده است
                    </p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat.id} className="rounded-xl p-2 hover:bg-muted/70">
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="block rounded-lg px-2 py-1.5 text-sm font-bold text-foreground hover:text-primary"
                          onClick={() => setCatsOpen(false)}
                        >
                          {cat.name}
                        </Link>
                        {cat.children?.length > 0 && (
                          <ul className="mt-1 space-y-0.5 border-s border-border/80 ps-3">
                            {cat.children.slice(0, 6).map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/categories/${child.slug}`}
                                  className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-background hover:text-primary"
                                  onClick={() => setCatsOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border bg-muted/30 px-4 py-2.5">
                  <Link
                    href="/products"
                    className="text-xs font-bold text-primary hover:underline"
                    onClick={() => setCatsOpen(false)}
                  >
                    مشاهده همه محصولات ←
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mx-2 h-5 w-px bg-border" />

          <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  pathname === `/categories/${cat.slug}` && "bg-muted text-foreground font-medium",
                )}
              >
                {cat.name}
              </Link>
            ))}
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground font-medium",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      )}

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی محصول..."
              className="h-11 w-full rounded-2xl border border-border bg-muted/40 pe-4 ps-10 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </form>

          <button
            type="button"
            onClick={() => setMobileCatsOpen((v) => !v)}
            className="mb-2 flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm font-bold text-secondary-foreground"
          >
            <span className="inline-flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              دسته‌بندی‌ها
            </span>
            <ChevronDown className={cn("h-4 w-4 transition", mobileCatsOpen && "rotate-180")} />
          </button>

          {mobileCatsOpen && (
            <div className="mb-3 space-y-1 rounded-xl border border-border p-2">
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
          )}

          <nav className="flex flex-col gap-1">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/account" className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
                  حساب کاربری
                </Link>
                {isAdmin() && (
                  <Link href="/admin" className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
                    پنل ادمین
                  </Link>
                )}
                <button
                  type="button"
                  className="rounded-lg px-3 py-2.5 text-start text-sm text-red-600 hover:bg-muted"
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
                className="mt-1 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-bold text-primary-foreground"
              >
                ورود | ثبت‌نام
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
