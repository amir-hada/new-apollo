"use client";

import { cn } from "@/lib/utils";
import { useShopSettings } from "@/lib/shop-settings-api";

export function ApolloShopLogo({ className }: { className?: string }) {
  const { data: shop } = useShopSettings();
  const title = shop?.shopTitle?.trim() || "فروشگاه";

  return (
    <div className={cn("text-center", className)}>
      <p className="text-2xl font-bold tracking-tight text-primary">{title}</p>
    </div>
  );
}
