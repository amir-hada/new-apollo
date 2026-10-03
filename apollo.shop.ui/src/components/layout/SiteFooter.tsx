"use client";

import Link from "next/link";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useShopSettings } from "@/lib/shop-settings-api";

export function SiteFooter() {
  const { settings } = useSiteSettings();
  const { data: shop } = useShopSettings();
  const footer = settings.footer;
  const brandName = shop?.shopTitle || footer.brandName;
  const description = shop?.description || footer.description;
  const phone = shop?.supportPhone || footer.supportPhone;
  const email = shop?.supportEmail || footer.supportEmail;

  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-primary">{brandName}</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">دسترسی سریع</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-foreground">
                محصولات
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-foreground">
                بلاگ
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-foreground">
                سوالات متداول
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">پشتیبانی</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {phone ? <li>{phone}</li> : null}
            {email ? <li>{email}</li> : null}
            <li>
              <Link href="/account/tickets" className="hover:text-foreground">
                تیکت‌های من
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-foreground">
                ورود به حساب
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {footer.copyright || brandName}
      </div>
    </footer>
  );
}
