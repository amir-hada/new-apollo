"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { formatPrice, formatDate } from "@/lib/utils";
import { orderStatusLabel } from "@/lib/labels";
import type { OrderListItem, PagedResult, Profile } from "@/types/api";

export default function AccountDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<Profile>("/api/account/profile")).data,
  });

  const orders = useQuery({
    queryKey: ["my-orders", 1],
    queryFn: async () => (await api.get<PagedResult<OrderListItem>>("/api/orders", { params: { page: 1, pageSize: 5 } })).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">سلام {user?.firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">خلاصه وضعیت حساب شما</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">ایمیل</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium">{profile.data?.email || user?.email}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">تعداد سفارش‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{orders.data?.totalCount ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">دسترسی سریع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link href="/account/orders" className="block text-primary hover:underline">
              سفارش‌ها
            </Link>
            <Link href="/account/tickets" className="block text-primary hover:underline">
              تیکت‌ها
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">آخرین سفارش‌ها</h2>
          <Link href="/account/orders" className="text-sm text-primary hover:underline">
            همه
          </Link>
        </div>
        {orders.isLoading && <Skeleton className="h-40 w-full" />}
        {orders.data && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">شماره</th>
                  <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-start font-medium">مبلغ</th>
                  <th className="px-4 py-3 text-start font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.items.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/account/orders/${o.id}`} className="text-primary hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{orderStatusLabel[o.status]}</td>
                    <td className="px-4 py-3">{formatPrice(o.grandTotal)}</td>
                    <td className="px-4 py-3">{formatDate(o.createdAtUtc)}</td>
                  </tr>
                ))}
                {orders.data.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      سفارشی ثبت نشده است
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
