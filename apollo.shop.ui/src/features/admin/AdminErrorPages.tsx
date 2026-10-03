"use client";

import Link from "next/link";
import { Construction, FileX, Lock, ServerOff, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

function ErrorPage({
  icon: Icon,
  code,
  title,
  description,
}: {
  icon: React.ElementType;
  code: string;
  title: string;
  description: string;
}) {
  return (
    <div className="m-auto flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-2">
      <Icon size={72} className="text-muted-foreground" />
      <h1 className="text-4xl font-bold tracking-tight">{code}</h1>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-center text-muted-foreground">{description}</p>
      <Button className="mt-4" render={<Link href="/admin" />}>
        بازگشت به داشبورد
      </Button>
    </div>
  );
}

export function UnauthorizedError() {
  return (
    <ErrorPage
      icon={Lock}
      code="۴۰۱"
      title="غیرمجاز"
      description="برای مشاهده این صفحه باید وارد حساب کاربری شوید."
    />
  );
}

export function ForbiddenError() {
  return (
    <ErrorPage
      icon={UserX}
      code="۴۰۳"
      title="دسترسی ممنوع"
      description="شما مجوز لازم برای مشاهده این صفحه را ندارید."
    />
  );
}

export function NotFoundError() {
  return (
    <ErrorPage
      icon={FileX}
      code="۴۰۴"
      title="صفحه یافت نشد"
      description="صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است."
    />
  );
}

export function ServerError() {
  return (
    <ErrorPage
      icon={ServerOff}
      code="۵۰۰"
      title="خطای سرور"
      description="مشکلی در سمت سرور رخ داده است. کمی بعد دوباره تلاش کنید."
    />
  );
}

export function MaintenanceError() {
  return (
    <ErrorPage
      icon={Construction}
      code="۵۰۳"
      title="در حال تعمیرات"
      description="سیستم موقتاً در دسترس نیست. به‌زودی برمی‌گردیم."
    />
  );
}
