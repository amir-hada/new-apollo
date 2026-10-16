"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { resolveProductImageUrl } from "@/lib/product-image";
import { getProductDisplayPrices } from "@/lib/product-price";
import {
  getActiveShopCurrency,
  toDisplayAmount,
} from "@/lib/shop-currency";
import { cn } from "@/lib/utils";
import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import type { ProductListItem } from "@/types/api";

function formatAmountFa(valueInToman: number, currency: string) {
  const amount = toDisplayAmount(valueInToman, currency as "تومان" | "ریال");
  return toPersianDigits(new Intl.NumberFormat("fa-IR").format(amount));
}

type AccountProductRailProps = {
  title: string;
  href?: string;
  products: ProductListItem[];
  emptyText?: string;
};

export function AccountProductRail({
  title,
  href,
  products,
  emptyText = "محصولی برای نمایش نیست",
}: AccountProductRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const currency = useShopCurrency() || getActiveShopCurrency();

  function scroll(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * -280, behavior: "smooth" });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            مشاهده همه
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Link>
        ) : null}
      </div>

      {products.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="absolute start-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted md:inline-flex"
            aria-label="قبلی"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="absolute end-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted md:inline-flex"
            aria-label="بعدی"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-0 overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => {
              const { current, original, discountPercent } =
                getProductDisplayPrices(product);
              const unavailable = !product.isAvailable;
              const lowStock =
                product.isAvailable &&
                product.stockQuantity > 0 &&
                product.stockQuantity <= 5;

              return (
                <article
                  key={product.id}
                  className="flex w-[180px] shrink-0 flex-col border-e border-border last:border-e-0 sm:w-[200px]"
                >
                  <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col px-3 pt-3">
                    <div className="relative aspect-square overflow-hidden bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveProductImageUrl(product.primaryImageUrl)}
                        alt={product.name}
                        className="size-full object-contain p-2"
                        loading="lazy"
                      />
                      {discountPercent != null ? (
                        <span className="absolute start-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          فروش ویژه
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-2 line-clamp-2 min-h-10 text-[12px] font-medium leading-5 text-foreground">
                      {product.name}
                    </h3>

                    {unavailable ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">ناموجود</p>
                    ) : lowStock ? (
                      <p className="mt-1 text-[11px] font-medium text-primary">
                        تنها {toPersianDigits(String(product.stockQuantity))} عدد در انبار باقی مانده
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-muted-foreground">موجود در انبار فروشگاه</p>
                    )}

                    <div className="mt-auto space-y-1 pb-2 pt-3">
                      {discountPercent != null && original != null ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatAmountFa(original, currency)}
                          </span>
                          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {toPersianDigits(String(discountPercent))}٪
                          </span>
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          "flex items-baseline justify-end gap-1",
                          unavailable && "opacity-50",
                        )}
                      >
                        <span className="text-[15px] font-bold">{formatAmountFa(current, currency)}</span>
                        <span className="text-[10px] text-muted-foreground">{currency}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-3 pb-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className={cn(
                        "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-primary bg-background text-[12px] font-semibold text-primary transition hover:bg-primary/5",
                        unavailable && "pointer-events-none opacity-50",
                      )}
                    >
                      <ShoppingCart className="size-3.5" />
                      مشاهده و خرید
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
