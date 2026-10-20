"use client";

import Link from "next/link";
import { CreditCard, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useShopSettings } from "@/lib/shop-settings-api";

export default function AdminBillingPage() {
  const user = useAuthStore((s) => s.user);
  const { data: settings } = useShopSettings();

  const shopTitle = settings?.shopTitle?.trim() || "فروشگاه";
  const adminName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "مدیر";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-2">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">صورتحساب</h1>
        <p className="text-sm text-muted-foreground">
          وضعیت اشتراک و فاکتورهای مرتبط با «{shopTitle}».
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium">اشتراک فعال فروشگاه</p>
            <p className="text-sm text-muted-foreground">
              مدیریت پلن و پرداخت اشتراک از پنل پلتفرم آپولو انجام می‌شود.
              در این پنل فقط اطلاعات فروشگاه و سفارش‌ها در دسترس است.
            </p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">فروشگاه</dt>
                <dd className="font-medium">{shopTitle}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">مدیر</dt>
                <dd className="font-medium">{adminName}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">ایمیل</dt>
                <dd className="font-medium" dir="ltr">
                  {user?.email || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Receipt className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">سفارش‌های مشتریان</p>
              <p className="text-sm text-muted-foreground">
                برای مشاهده و پیگیری سفارش‌های ثبت‌شده در فروشگاه، به بخش
                سفارش‌ها بروید.
              </p>
            </div>
            <Button render={<Link href="/admin/orders" />} variant="outline">
              مشاهده سفارش‌ها
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
