"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAdminPageTitle } from "@/lib/admin-page-title";
import { useShopSettings } from "@/lib/shop-settings-api";

const PAGE_TITLES: { match: RegExp | string; title: string }[] = [
  { match: /^\/login/, title: "ورود" },
  { match: /^\/register/, title: "ثبت‌نام" },
  { match: /^\/products/, title: "محصولات" },
  { match: /^\/blog/, title: "بلاگ" },
  { match: /^\/cart/, title: "سبد خرید" },
  { match: /^\/checkout/, title: "تسویه حساب" },
  { match: /^\/account/, title: "حساب کاربری" },
];

function resolvePageTitle(pathname: string) {
  if (pathname.startsWith("/admin")) {
    return getAdminPageTitle(pathname);
  }
  for (const item of PAGE_TITLES) {
    if (typeof item.match === "string") {
      if (pathname === item.match) return item.title;
    } else if (item.match.test(pathname)) {
      return item.title;
    }
  }
  return null;
}

function buildTitle(pathname: string, site: string) {
  const page = resolvePageTitle(pathname);
  return page && page !== site ? `${page} | ${site}` : site;
}

/** Keeps the browser tab title stable and readable during client navigations. */
export function DocumentTitle() {
  const pathname = usePathname();
  const { data } = useShopSettings();
  const site =
    data?.browserTitle?.trim() ||
    data?.shopTitle?.trim() ||
    "فروشگاه آپولو";

  useEffect(() => {
    document.title = buildTitle(pathname, site);
  }, [pathname, site]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
        document.title = buildTitle(url.pathname, site);
      } catch {
        /* ignore */
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [site]);

  return null;
}
