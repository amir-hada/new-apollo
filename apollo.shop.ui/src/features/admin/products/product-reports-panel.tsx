"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Heart,
  MessageSquare,
  Package,
  Percent,
  ShoppingBag,
  ShoppingCart,
  Star,
  TrendingUp,
  Undo2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductReport } from "@/types/api";

type ProductReportsPanelProps = {
  productId: string;
};

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{title}</p>
          <p className="mt-1 truncate text-base font-semibold tracking-tight">{value}</p>
          {hint ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            accent ?? "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

function formatShortDate(iso: string) {
  const parts = iso.split("-");
  if (parts.length < 3) return iso;
  return toPersianDigits(`${parts[1]}/${parts[2]}`);
}

export function ProductReportsPanel({ productId }: ProductReportsPanelProps) {
  const [days, setDays] = useState(30);

  const report = useQuery({
    queryKey: ["admin-product-report", productId, days],
    queryFn: async () =>
      (await api.get<ProductReport>(`/api/admin/products/${productId}/reports`, {
        params: { days },
      })).data,
  });

  const chartData = useMemo(() => {
    const timeline = report.data?.timeline ?? [];
    return timeline.map((p) => ({
      ...p,
      label: formatShortDate(p.date),
    }));
  }, [report.data?.timeline]);

  if (report.isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pt-1">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      </div>
    );
  }

  if (report.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(report.error)}
        onRetry={() => report.refetch()}
      />
    );
  }

  const data = report.data!;
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pt-1">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          بازه تحلیل: {toPersianDigits(String(data.days))} روز اخیر
        </p>
        <div className="grid w-full grid-cols-3 gap-1 sm:flex sm:w-auto">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              type="button"
              size="sm"
              variant={days === d ? "default" : "outline"}
              className="h-9 touch-manipulation px-3 sm:h-8"
              onClick={() => setDays(d)}
            >
              {toPersianDigits(String(d))} روز
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pe-0.5 pb-3">
        <div className="grid gap-2 grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="میزان فروش"
            value={formatPrice(data.revenue)}
            hint={`${toPersianDigits(String(data.unitsSold))} عدد · ${toPersianDigits(String(data.orderCount))} سفارش`}
            icon={TrendingUp}
          />
          <KpiCard
            title="بازدید"
            value={toPersianDigits(String(data.views))}
            hint={`${toPersianDigits(String(data.uniqueViews))} یکتا`}
            icon={Eye}
            accent="bg-sky-500/10 text-sky-700 dark:text-sky-300"
          />
          <KpiCard
            title="لایک"
            value={toPersianDigits(String(data.likes))}
            icon={Heart}
            accent="bg-rose-500/10 text-rose-700 dark:text-rose-300"
          />
          <KpiCard
            title="کامنت"
            value={toPersianDigits(String(data.comments))}
            hint={
              data.averageRating != null
                ? `میانگین امتیاز ${toPersianDigits(data.averageRating.toFixed(1))}`
                : undefined
            }
            icon={MessageSquare}
            accent="bg-violet-500/10 text-violet-700 dark:text-violet-300"
          />
          <KpiCard
            title="نرخ تبدیل"
            value={`${toPersianDigits(String(data.conversionRatePercent))}٪`}
            hint="سفارش نسبت به بازدید"
            icon={Percent}
            accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          />
          <KpiCard
            title="میانگین ارزش سفارش"
            value={formatPrice(data.averageOrderValue)}
            icon={ShoppingBag}
          />
          <KpiCard
            title="در سبدها"
            value={toPersianDigits(String(data.cartQuantity))}
            hint="تعداد فعلی در سبد کاربران"
            icon={ShoppingCart}
            accent="bg-amber-500/10 text-amber-700 dark:text-amber-300"
          />
          <KpiCard
            title={data.trackInventory ? "موجودی فعلی" : "مرجوعی‌ها"}
            value={
              data.trackInventory
                ? toPersianDigits(String(data.stockQuantity))
                : toPersianDigits(String(data.returnedUnits))
            }
            hint={
              data.trackInventory
                ? `مرجوعی: ${toPersianDigits(String(data.returnedUnits))}`
                : "در بازه انتخاب‌شده"
            }
            icon={data.trackInventory ? Package : Undo2}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-border/80 bg-card/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">روند فروش</h3>
              <Star className="size-3.5 text-muted-foreground" />
            </div>
            <div className="h-48 w-full sm:h-56" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${Math.round(v / 1_000_000)}M`
                        : v >= 1000
                          ? `${Math.round(v / 1000)}k`
                          : String(v)
                    }
                    domain={[0, maxRevenue * 1.1]}
                  />
                  <Tooltip
                    formatter={(value) => formatPrice(Number(value ?? 0))}
                    labelFormatter={(label) => `تاریخ ${label}`}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="فروش"
                    stroke="#0d9488"
                    fill="url(#revFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/40 p-3">
            <h3 className="mb-2 text-sm font-medium">بازدید روزانه</h3>
            <div className="h-48 w-full sm:h-56" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tickFormatter={(v) => toPersianDigits(String(v))}
                  />
                  <Tooltip
                    formatter={(value) => toPersianDigits(String(value ?? 0))}
                    labelFormatter={(label) => `تاریخ ${label}`}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="views"
                    name="بازدید"
                    fill="hsl(199 89% 48%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/40 p-3">
            <h3 className="mb-2 text-sm font-medium">تعامل کاربران</h3>
            <div className="h-48 w-full sm:h-56" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tickFormatter={(v) => toPersianDigits(String(v))}
                  />
                  <Tooltip
                    formatter={(value) => toPersianDigits(String(value ?? 0))}
                    labelFormatter={(label) => `تاریخ ${label}`}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    name="لایک"
                    stroke="hsl(346 77% 50%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    name="کامنت"
                    stroke="hsl(262 83% 58%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="unitsSold"
                    name="فروش (عدد)"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/40 p-3">
            <h3 className="mb-2 text-sm font-medium">فروش بر اساس تنوع</h3>
            {(data.variantSales?.length ?? 0) === 0 ? (
              <p className="flex h-48 items-center sm:h-56 justify-center text-sm text-muted-foreground">
                در این بازه فروشی ثبت نشده است.
              </p>
            ) : (
              <div className="h-48 overflow-auto sm:h-56">
                <table className="w-full min-w-[280px] text-sm">
                  <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 text-start font-medium">تنوع</th>
                      <th className="px-2 py-2 text-start font-medium">تعداد</th>
                      <th className="px-2 py-2 text-start font-medium">مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.variantSales.map((v) => (
                      <tr key={v.variantId} className="border-t border-border/70">
                        <td className="max-w-[10rem] px-2 py-2 sm:max-w-none">
                          <div className="truncate font-medium">{v.name}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {v.sku}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {toPersianDigits(String(v.unitsSold))}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {formatPrice(v.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
