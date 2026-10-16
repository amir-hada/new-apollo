"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Percent, Zap } from "lucide-react";
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

function padFa(n: number) {
  return toPersianDigits(String(n).padStart(2, "0"));
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    finished: diff <= 0,
  };
}

function TimerBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-white px-1.5 text-[15px] font-bold tabular-nums text-[#3f4064] shadow-sm sm:h-10 sm:min-w-10 sm:text-base">
        {value}
      </span>
      <span className="text-[10px] text-white/80 sm:text-[11px]">{label}</span>
    </div>
  );
}

function formatAmountFa(valueInToman: number, currency: string) {
  const amount = toDisplayAmount(valueInToman, currency as "تومان" | "ریال");
  return toPersianDigits(new Intl.NumberFormat("fa-IR").format(amount));
}

function AmazingProductCard({ product }: { product: ProductListItem }) {
  const currency = useShopCurrency() || getActiveShopCurrency();
  const { current, original, discountPercent } = getProductDisplayPrices(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex w-[148px] shrink-0 flex-col rounded-md bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[168px] dark:bg-card"
    >
      <div className="relative mb-2 aspect-square overflow-hidden bg-white dark:bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveProductImageUrl(product.primaryImageUrl)}
          alt={product.name}
          className="size-full object-contain p-2 transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {discountPercent != null ? (
          <span className="absolute start-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {toPersianDigits(String(discountPercent))}٪
          </span>
        ) : null}
      </div>

      <h3 className="mb-2 line-clamp-2 min-h-[2.4rem] text-[12px] font-semibold leading-5 text-[#3f4064] dark:text-foreground">
        {product.name}
      </h3>

      <div className="mt-auto space-y-0.5">
        {original != null ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-[11px] text-[#a1a3a8] line-through">
              {formatAmountFa(original, currency)}
            </span>
          </div>
        ) : (
          <div className="h-4" aria-hidden />
        )}
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-[14px] font-bold text-[#3f4064] dark:text-foreground">
            {formatAmountFa(current, currency)}
          </span>
          <span className="text-[10px] text-[#81858b]">{currency}</span>
        </div>
      </div>
    </Link>
  );
}

export function AmazingOffers({ products }: { products: ProductListItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const target = useMemo(() => endOfToday(), []);
  const { hours, minutes, seconds, finished } = useCountdown(target);

  const items = useMemo(() => {
    const discounted = products.filter((p) => {
      const { discountPercent } = getProductDisplayPrices(p);
      return discountPercent != null;
    });
    return (discounted.length >= 3 ? discounted : products).slice(0, 12);
  }, [products]);

  if (items.length === 0) return null;

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(360, el.clientWidth * 0.7) * dir;
    el.scrollBy({ left: -amount, behavior: "smooth" });
  };

  return (
    <section className="w-full px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative overflow-hidden rounded-md bg-[linear-gradient(105deg,var(--primary)_0%,color-mix(in_oklab,var(--primary)_78%,#111)_55%,color-mix(in_oklab,var(--primary)_55%,#0a0a0a)_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-36 w-36 rounded-full bg-black/20 blur-2xl"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm sm:size-11">
              <Zap className="size-5 fill-white/30 sm:size-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-[16px] font-black tracking-tight text-white sm:text-[20px]">
                  پیشنهاد شگفت‌انگیز
                </h2>
                <Percent className="size-4 shrink-0 text-white/80 sm:size-5" />
              </div>
              <p className="mt-0.5 text-[11px] text-white/75 sm:text-xs">
                فرصت محدود — تا پایان امروز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {!finished ? (
              <div className="flex items-end gap-1.5" dir="ltr">
                <TimerBox value={padFa(hours)} label="ساعت" />
                <span className="mb-5 text-base font-bold text-white/90">:</span>
                <TimerBox value={padFa(minutes)} label="دقیقه" />
                <span className="mb-5 text-base font-bold text-white/90">:</span>
                <TimerBox value={padFa(seconds)} label="ثانیه" />
              </div>
            ) : (
              <span className="rounded-md bg-white/15 px-3 py-2 text-xs font-medium text-white">
                پیشنهاد امروز تمام شد
              </span>
            )}
          </div>
        </div>

        <div className="relative px-1 pb-4 sm:px-3 sm:pb-5">
          <button
            type="button"
            aria-label="اسکرول به راست"
            onClick={() => scrollBy(-1)}
            className="absolute start-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#3f4064] shadow-md transition hover:bg-white/95 md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="اسکرول به چپ"
            onClick={() => scrollBy(1)}
            className="absolute end-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#3f4064] shadow-md transition hover:bg-white/95 md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            ref={scrollerRef}
            className={cn(
              "flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-2 pb-1 pt-1 sm:gap-3 sm:px-4",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {items.map((product) => (
              <div key={product.id} className="snap-start">
                <AmazingProductCard product={product} />
              </div>
            ))}

            <Link
              href="/products?sort=featured"
              className="flex w-[120px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-md bg-white/10 px-3 text-center text-white ring-1 ring-white/20 transition hover:bg-white/15 sm:w-[140px]"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-white/15">
                <ChevronLeft className="size-5" />
              </span>
              <span className="text-[12px] font-medium">مشاهده همه</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
