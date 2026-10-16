"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Eye,
  Heart,
  MessageSquare,
  Package,
  Percent,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "@/components/shared/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import type { DashboardReport, OrderListItem, PagedResult, TopProduct } from "@/types/api";

const STATUS_LABELS: Record<string, string> = {
  Pending: "در انتظار",
  Paid: "پرداخت‌شده",
  Processing: "در حال آماده‌سازی",
  Shipped: "ارسال‌شده",
  Delivered: "تحویل‌شده",
  Cancelled: "لغو‌شده",
  Returned: "مرجوعی",
};

const STATUS_BY_CODE = [
  "Pending",
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;

function orderStatusLabel(status: string | number) {
  if (typeof status === "number") {
    return STATUS_LABELS[STATUS_BY_CODE[status] ?? ""] ?? String(status);
  }
  return STATUS_LABELS[status] ?? status;
}

const STATUS_COLORS = [
  "hsl(var(--primary))",
  "#22c55e",
  "#06b6d4",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#94a3b8",
];

function formatFaDateTime(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function formatFaTimeShort(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatShortDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(d);
}

function deltaPercent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs sm:text-sm">
      <Clock3 className="size-4 shrink-0 text-primary" />
      <span className="font-medium tabular-nums sm:hidden">
        {toPersianDigits(formatFaTimeShort(now))}
      </span>
      <span className="hidden font-medium tabular-nums sm:inline">
        {toPersianDigits(formatFaDateTime(now))}
      </span>
    </div>
  );
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number | null;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
          {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
          {typeof trend === "number" ? (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium",
                up
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              )}
            >
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {toPersianDigits(`${Math.abs(trend)}٪`)} نسبت به دیروز
            </div>
          ) : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-sm" style={{ background: item.color }} />
          <span>{item.name}:</span>
          <span className="font-medium text-foreground">
            {item.dataKey === "sales"
              ? formatPrice(Number(item.value ?? 0))
              : toPersianDigits(String(item.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}

function ProductTable({
  products,
  empty,
  mode,
}: {
  products: TopProduct[];
  empty: string;
  mode: "sales" | "views";
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>محصول</TableHead>
            <TableHead>{mode === "sales" ? "فروش" : "بازدید"}</TableHead>
            <TableHead>درآمد</TableHead>
            <TableHead>لایک</TableHead>
            <TableHead className="text-start">گزارش</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p, index) => (
            <TableRow key={p.productId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {toPersianDigits(String(index + 1))}
                  </span>
                  <span className="font-medium">{p.productName}</span>
                </div>
              </TableCell>
              <TableCell>
                {toPersianDigits(
                  String(mode === "sales" ? p.quantitySold : (p.views ?? 0)),
                )}
              </TableCell>
              <TableCell>{formatPrice(p.revenue)}</TableCell>
              <TableCell>{toPersianDigits(String(p.likes ?? 0))}</TableCell>
              <TableCell>
                <Link
                  href={`/admin/products/${p.productId}?tab=reports`}
                  className="inline-flex h-8 items-center rounded-lg px-2 text-sm text-primary hover:bg-muted"
                >
                  جزئیات
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function AdminDashboardReport() {
  const report = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () =>
      (await api.get<DashboardReport>("/api/admin/reports/dashboard")).data,
    refetchInterval: 60_000,
  });

  const recentOrders = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () =>
      (
        await api.get<PagedResult<OrderListItem>>("/api/admin/orders", {
          params: { page: 1, pageSize: 8 },
        })
      ).data,
  });

  const chartData = useMemo(() => {
    const days = report.data?.last30Days ?? [];
    return days.map((d) => ({
      ...d,
      label: formatShortDay(d.date),
    }));
  }, [report.data?.last30Days]);

  const pieData = useMemo(() => {
    return (report.data?.ordersByStatus ?? [])
      .filter((s) => s.count > 0)
      .map((s) => ({
        name: STATUS_LABELS[s.status] ?? s.status,
        value: s.count,
      }));
  }, [report.data?.ordersByStatus]);

  if (report.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (report.isError || !report.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(report.error)}
        onRetry={() => report.refetch()}
      />
    );
  }

  const d = report.data;
  const salesTrend = deltaPercent(d.todaySales, d.yesterdaySales);
  const viewsTrendHint = d.todayViews > 0 ? "بازدید امروز فعال است" : "هنوز بازدیدی ثبت نشده";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-lg px-3 py-1">
              مرکز فرمان فروشگاه
            </Badge>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                گزارش جامع عملکرد
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                نمای زنده از فروش، بازدید، سفارش‌ها و تعامل مشتریان — به‌روز در همان لحظه که وارد پنل
                می‌شوید.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LiveClock />
              <Badge variant="outline" className="rounded-lg">
                نرخ تبدیل {toPersianDigits(String(d.conversionRatePercent))}٪
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void report.refetch();
                void recentOrders.refetch();
              }}
            >
              <RefreshCw className="size-4" />
              به‌روزرسانی
            </Button>
            <Button render={<Link href="/admin/orders" />}>مدیریت سفارش‌ها</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="فروش امروز"
          value={formatPrice(d.todaySales)}
          hint={`هفته: ${formatPrice(d.weekSales)}`}
          icon={Wallet}
          trend={salesTrend}
        />
        <KpiCard
          title="سفارش امروز"
          value={toPersianDigits(String(d.todayOrders))}
          hint={`در انتظار: ${toPersianDigits(String(d.pendingOrders))}`}
          icon={ShoppingCart}
        />
        <KpiCard
          title="بازدید امروز"
          value={toPersianDigits(String(d.todayViews))}
          hint={viewsTrendHint}
          icon={Eye}
        />
        <KpiCard
          title="کاربران جدید امروز"
          value={toPersianDigits(String(d.newUsersToday))}
          hint={`این ماه: ${toPersianDigits(String(d.newUsersMonth))}`}
          icon={Users}
        />
        <KpiCard
          title="فروش کل"
          value={formatPrice(d.totalSales)}
          hint={`میانگین سفارش: ${formatPrice(d.averageOrderValue)}`}
          icon={TrendingUp}
        />
        <KpiCard
          title="فروش ماه"
          value={formatPrice(d.monthSales)}
          hint={`دیروز: ${formatPrice(d.yesterdaySales)}`}
          icon={Activity}
        />
        <KpiCard
          title="بازدید کل"
          value={toPersianDigits(String(d.totalViews))}
          hint={`لایک ${toPersianDigits(String(d.totalLikes))} · نظر ${toPersianDigits(String(d.totalComments))}`}
          icon={Heart}
        />
        <KpiCard
          title="وضعیت فروشگاه"
          value={toPersianDigits(String(d.productCount))}
          hint={`کم‌موجودی ${toPersianDigits(String(d.lowStockProducts))} · تیکت باز ${toPersianDigits(String(d.openTickets))}`}
          icon={Package}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted p-1">
          <TabsTrigger value="overview" className="rounded-lg">نمای کلی</TabsTrigger>
          <TabsTrigger value="sales" className="rounded-lg">فروش</TabsTrigger>
          <TabsTrigger value="traffic" className="rounded-lg">بازدید و تعامل</TabsTrigger>
          <TabsTrigger value="products" className="rounded-lg">گزارش محصولات</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg">سفارش‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-5">
            <div className="rounded-xl border border-border bg-card p-4 xl:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">روند ۳۰ روزه فروش و سفارش</h3>
                  <p className="text-xs text-muted-foreground">داده‌های واقعی پرداخت‌شده</p>
                </div>
                <Badge variant="outline">۳۰ روز</Badge>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => toPersianDigits(String(v))}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="فروش"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.12)"
                      strokeWidth={2}
                    />
                    <Bar dataKey="orders" name="سفارش" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4 xl:col-span-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 font-semibold">وضعیت سفارش‌ها</h3>
                <div className="h-[220px]">
                  {pieData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      هنوز سفارشی ثبت نشده است.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">تحویل‌شده</p>
                  <p className="mt-1 text-lg font-bold">{toPersianDigits(String(d.completedOrders))}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">لغو / مرجوعی</p>
                  <p className="mt-1 text-lg font-bold">
                    {toPersianDigits(String(d.cancelledOrders + d.returnedOrders))}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">تیکت باز</p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-bold">
                    <Ticket className="size-4 text-primary" />
                    {toPersianDigits(String(d.openTickets))}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">نرخ تبدیل</p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-bold">
                    <Percent className="size-4 text-primary" />
                    {toPersianDigits(String(d.conversionRatePercent))}٪
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard title="فروش کل" value={formatPrice(d.totalSales)} icon={Wallet} />
            <KpiCard title="فروش ماه" value={formatPrice(d.monthSales)} icon={TrendingUp} />
            <KpiCard title="میانگین سبد" value={formatPrice(d.averageOrderValue)} icon={ShoppingBag} />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">مقایسه فروش روزانه</h3>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => toPersianDigits(String(v))}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sales" name="فروش" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">پرفروش‌ترین محصولات</h3>
              <Button variant="ghost" size="sm" render={<Link href="/admin/products" />}>
                همه محصولات
              </Button>
            </div>
            <ProductTable
              products={d.topProducts}
              empty="هنوز فروشی ثبت نشده است."
              mode="sales"
            />
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard title="بازدید امروز" value={toPersianDigits(String(d.todayViews))} icon={Eye} />
            <KpiCard title="بازدید کل" value={toPersianDigits(String(d.totalViews))} icon={Activity} />
            <KpiCard title="لایک‌ها" value={toPersianDigits(String(d.totalLikes))} icon={Heart} />
            <KpiCard title="نظرات تأییدشده" value={toPersianDigits(String(d.totalComments))} icon={MessageSquare} />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">روند بازدید و کاربران جدید</h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => toPersianDigits(String(v))}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="views" name="بازدید" stroke="#7c3aed" fill="#7c3aed1a" strokeWidth={2} />
                  <Area type="monotone" dataKey="newUsers" name="کاربر جدید" stroke="#16a34a" fill="#16a34a1a" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">پربازدیدترین محصولات</h3>
            <ProductTable
              products={d.topViewedProducts}
              empty="هنوز بازدیدی ثبت نشده است."
              mode="views"
            />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard title="تعداد محصولات" value={toPersianDigits(String(d.productCount))} icon={Package} />
            <KpiCard
              title="کم‌موجودی"
              value={toPersianDigits(String(d.lowStockProducts))}
              hint="نیاز به بررسی انبار"
              icon={Package}
            />
            <KpiCard
              title="نرخ تبدیل کلی"
              value={`${toPersianDigits(String(d.conversionRatePercent))}٪`}
              hint="سفارش پرداخت‌شده نسبت به بازدید"
              icon={Percent}
            />
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <h3 className="text-lg font-semibold">گزارش جزئی هر محصول</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              از جدول زیر روی «جزئیات» بزنید تا تب گزارش همان محصول (بازدید روزانه، فروش، لایک، نظر و واریانت‌ها) باز شود.
            </p>
          </div>
          <Tabs defaultValue="best-sellers">
            <TabsList className="rounded-xl">
              <TabsTrigger value="best-sellers" className="rounded-lg">پرفروش‌ها</TabsTrigger>
              <TabsTrigger value="most-viewed" className="rounded-lg">پربازدیدها</TabsTrigger>
            </TabsList>
            <TabsContent value="best-sellers" className="mt-4">
              <ProductTable products={d.topProducts} empty="داده‌ای نیست." mode="sales" />
            </TabsContent>
            <TabsContent value="most-viewed" className="mt-4">
              <ProductTable products={d.topViewedProducts} empty="داده‌ای نیست." mode="views" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard title="کل سفارش‌ها" value={toPersianDigits(String(d.orderCount))} icon={ShoppingCart} />
            <KpiCard title="در انتظار" value={toPersianDigits(String(d.pendingOrders))} icon={Clock3} />
            <KpiCard title="تحویل‌شده" value={toPersianDigits(String(d.completedOrders))} icon={Package} />
            <KpiCard
              title="لغو / مرجوعی"
              value={toPersianDigits(String(d.cancelledOrders + d.returnedOrders))}
              icon={Activity}
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">آخرین سفارش‌ها</h3>
              <Button variant="outline" size="sm" render={<Link href="/admin/orders" />}>
                مشاهده همه
              </Button>
            </div>
            {recentOrders.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(recentOrders.data?.items ?? []).map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <div>
                      <p className="text-sm font-medium">سفارش {toPersianDigits(o.orderNumber)}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customerEmail || "مشتری"} · {orderStatusLabel(o.status)}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">{formatPrice(o.grandTotal)}</div>
                  </Link>
                ))}
                {(recentOrders.data?.items.length ?? 0) === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">سفارشی وجود ندارد.</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
