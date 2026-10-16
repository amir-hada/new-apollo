"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Package,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import { AccountProductRail } from "@/features/account/AccountProductRail";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { OrderListItem, PagedResult, ProductListItem } from "@/types/api";

/** Current / in-progress statuses: Pending, Paid, Processing, Shipped */
const CURRENT_STATUSES = new Set([0, 1, 2, 3]);
const DELIVERED = 4;
const RETURNED = 6;

export default function AccountDashboardPage() {
  const orders = useQuery({
    queryKey: ["my-orders-summary"],
    queryFn: async () =>
      (await api.get<PagedResult<OrderListItem>>("/api/orders", { params: { page: 1, pageSize: 100 } }))
        .data,
  });

  const featured = useQuery({
    queryKey: ["account-featured-products"],
    queryFn: async () =>
      (
        await api.get<PagedResult<ProductListItem>>("/api/products", {
          params: { page: 1, pageSize: 12, sort: "featured" },
        })
      ).data,
  });

  const bestsellers = useQuery({
    queryKey: ["account-bestseller-products"],
    queryFn: async () =>
      (
        await api.get<PagedResult<ProductListItem>>("/api/products", {
          params: { page: 1, pageSize: 12, sort: "best_selling" },
        })
      ).data,
  });

  const counts = useMemo(() => {
    const items = orders.data?.items ?? [];
    return {
      current: items.filter((o) => CURRENT_STATUSES.has(o.status)).length,
      delivered: items.filter((o) => o.status === DELIVERED).length,
      returned: items.filter((o) => o.status === RETURNED).length,
    };
  }, [orders.data]);

  const statusCards = [
    {
      key: "current",
      label: "جاری",
      count: counts.current,
      href: "/account/orders",
      icon: Package,
      iconClass: "text-sky-600 bg-sky-500/10",
    },
    {
      key: "delivered",
      label: "تحویل شده",
      count: counts.delivered,
      href: "/account/orders",
      icon: PackageCheck,
      iconClass: "text-emerald-600 bg-emerald-500/10",
    },
    {
      key: "returned",
      label: "مرجوع شده",
      count: counts.returned,
      href: "/account/orders",
      icon: RotateCcw,
      iconClass: "text-amber-600 bg-amber-500/10",
    },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h2 className="text-[15px] font-bold">سفارش‌های من</h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            مشاهده همه
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Link>
        </div>

        {orders.isLoading ? (
          <div className="grid grid-cols-3 gap-2 p-4 sm:gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 divide-x divide-border divide-x-reverse">
            {statusCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.key}
                  href={card.href}
                  className="flex flex-col items-center gap-2 px-2 py-5 text-center transition hover:bg-muted/40 sm:px-4 sm:py-6"
                >
                  <span
                    className={cn(
                      "inline-flex size-12 items-center justify-center rounded-full sm:size-14",
                      card.iconClass,
                    )}
                  >
                    <Icon className="size-6 sm:size-7" strokeWidth={1.75} />
                  </span>
                  <span className="text-[13px] font-medium text-foreground sm:text-sm">
                    {card.label}
                  </span>
                  <span className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
                    {toPersianDigits(String(card.count))}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {featured.isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <AccountProductRail
          title="پیشنهادهای ویژه برای شما"
          href="/products?sort=featured"
          products={featured.data?.items ?? []}
          emptyText="فعلاً پیشنهاد ویژه‌ای موجود نیست"
        />
      )}

      {bestsellers.isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <AccountProductRail
          title="خریدهای پرتکرار و پرفروش"
          href="/products?sort=best_selling"
          products={bestsellers.data?.items ?? []}
          emptyText="هنوز محصول پرفروشی ثبت نشده است"
        />
      )}
    </div>
  );
}
