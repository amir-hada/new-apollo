"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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

type ProductCardProps = {
  product: ProductListItem;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const currency = useShopCurrency() || getActiveShopCurrency();
  const { current, original, discountPercent } = getProductDisplayPrices(product);
  const unavailable = !product.isAvailable;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex h-full flex-col bg-background transition-shadow",
        /* فقط خطوط داخلی بین کارت‌ها؛ لبه چپ/راست بیرونی گرید خالی می‌ماند */
        "border-b border-e border-[#e0e0e2] dark:border-white/10",
        "hover:z-[1] hover:shadow-[0_1px_6px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveProductImageUrl(product.primaryImageUrl)}
          alt={product.name}
          className="size-full object-contain p-2 transition duration-300 group-hover:scale-[1.02] sm:p-3"
          loading="lazy"
        />

        {unavailable ? (
          <span className="absolute start-2 top-2 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] font-medium text-background backdrop-blur-sm">
            ناموجود
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-3 pt-1.5 sm:px-3 sm:pb-3.5">
        <h3 className="line-clamp-2 text-[12px] font-semibold leading-5 text-foreground sm:text-[13px] sm:leading-[1.35]">
          {product.name}
        </h3>

        {product.brandName ? (
          <p className="truncate text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
            {product.brandName}
          </p>
        ) : null}

        <div className="mt-auto space-y-0.5 pt-1">
          {discountPercent != null && original != null ? (
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[11px] text-muted-foreground line-through decoration-muted-foreground/70 sm:text-xs">
                {formatAmountFa(original, currency)}
              </span>
              <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground sm:text-[11px]">
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
            <span className="text-[15px] font-bold tracking-tight text-foreground sm:text-base">
              {formatAmountFa(current, currency)}
            </span>
            <span className="text-[10px] text-muted-foreground sm:text-[11px]">
              {currency}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * شبکه محصول مثل دیجی‌کالا:
 * بدون ردیوس، بدون بوردر چپ/راست بیرونی؛ فقط خطوط بین کارت‌ها
 */
export function ProductGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-0 rounded-none bg-background",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
        /* لبهٔ بیرونی (آخرین ستون هر ردیف) بدون خط عمودی */
        "[&>*:nth-child(2n)]:border-e-0",
        "sm:[&>*:nth-child(2n)]:border-e sm:[&>*:nth-child(3n)]:border-e-0",
        "md:[&>*:nth-child(3n)]:border-e md:[&>*:nth-child(4n)]:border-e-0",
        "lg:[&>*:nth-child(4n)]:border-e lg:[&>*:nth-child(6n)]:border-e-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
