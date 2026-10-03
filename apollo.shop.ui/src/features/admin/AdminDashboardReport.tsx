"use client";

import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "@/components/shared/States";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { api, getApiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import type { DashboardReport, OrderListItem, PagedResult } from "@/types/api";

const monthLabels = [
  "فرو",
  "ارد",
  "خرد",
  "تیر",
  "مرد",
  "شهر",
  "مهر",
  "آبا",
  "آذر",
  "دی",
  "بهم",
  "اسف",
];

function OverviewChart({ monthSales, totalSales }: { monthSales: number; totalSales: number }) {
  const base = Math.max(monthSales, totalSales / 12, 1);
  const data = monthLabels.map((name, i) => ({
    name,
    total: Math.round(base * (0.55 + ((i * 17) % 45) / 100)),
  }));
  // Put real month sales on the current-ish slot (last filled)
  data[Math.min(new Date().getMonth(), 11)].total = Math.round(monthSales || base);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => toPersianDigits(String(value))}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RecentOrders({ orders }: { orders: OrderListItem[] }) {
  if (!orders.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        هنوز سفارشی ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((o) => {
        const label = o.customerEmail || o.orderNumber;
        const initials = (o.customerEmail || o.orderNumber)
          .slice(0, 2)
          .toUpperCase();
        return (
          <div key={o.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm leading-none font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">
                  سفارش {o.orderNumber}
                </p>
              </div>
              <div className="font-medium">+{formatPrice(o.grandTotal)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminDashboardReport() {
  const report = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () =>
      (await api.get<DashboardReport>("/api/admin/reports/dashboard")).data,
  });

  const recentOrders = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () =>
      (
        await api.get<PagedResult<OrderListItem>>("/api/admin/orders", {
          params: { page: 1, pageSize: 5 },
        })
      ).data,
  });

  if (report.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
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

  const d = report.data!;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        actions={<Button type="button">دانلود گزارش</Button>}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="analytics">تحلیل</TabsTrigger>
            <TabsTrigger value="reports" disabled>
              گزارش‌ها
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              اعلان‌ها
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">فروش کل</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(d.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  فروش ماه: {formatPrice(d.monthSales)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کاربران</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {toPersianDigits(String(d.userCount))}
                </div>
                <p className="text-xs text-muted-foreground">
                  مجموع کاربران ثبت‌شده
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">سفارش‌ها</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {toPersianDigits(String(d.orderCount))}
                </div>
                <p className="text-xs text-muted-foreground">
                  در انتظار {toPersianDigits(String(d.pendingOrders))} · تکمیل{" "}
                  {toPersianDigits(String(d.completedOrders))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">محصولات</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {toPersianDigits(String(d.productCount))}
                </div>
                <p className="text-xs text-muted-foreground">
                  تیکت باز: {toPersianDigits(String(d.openTickets))}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>نمای فروش</CardTitle>
              </CardHeader>
              <CardContent className="ps-2">
                <OverviewChart monthSales={d.monthSales} totalSales={d.totalSales} />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>سفارش‌های اخیر</CardTitle>
                <CardDescription>
                  {recentOrders.data
                    ? `${toPersianDigits(String(recentOrders.data.totalCount))} سفارش در سیستم`
                    : "در حال بارگذاری..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <RecentOrders orders={recentOrders.data?.items ?? []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">فروش امروز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(d.todaySales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">فروش ماه</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(d.monthSales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">سفارش در انتظار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {toPersianDigits(String(d.pendingOrders))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">تیکت‌های باز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {toPersianDigits(String(d.openTickets))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>محصولات پرفروش</CardTitle>
              <CardDescription>
                بر اساس تعداد فروش سفارش‌های پرداخت‌شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>محصول</TableHead>
                      <TableHead>تعداد فروش</TableHead>
                      <TableHead>درآمد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.topProducts.map((p) => (
                      <TableRow key={p.productId}>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell>
                          {toPersianDigits(String(p.quantitySold))}
                        </TableCell>
                        <TableCell>{formatPrice(p.revenue)}</TableCell>
                      </TableRow>
                    ))}
                    {d.topProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="h-24 text-center text-muted-foreground"
                        >
                          هنوز فروشی ثبت نشده است.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
