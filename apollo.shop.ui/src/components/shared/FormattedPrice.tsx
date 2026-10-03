"use client";

import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import { formatPrice } from "@/lib/shop-currency";
import { cn } from "@/lib/utils";

/** نمایش قیمت با واحد پول فعال فروشگاه (قیمت ورودی بر حسب تومان). */
export function FormattedPrice({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const currency = useShopCurrency();
  return <span className={cn(className)}>{formatPrice(value, currency)}</span>;
}
