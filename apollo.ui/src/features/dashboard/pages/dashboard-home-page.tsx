import { Link } from "react-router-dom"
import {
  ArrowUpRightIcon,
  LayersIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/features/auth/context/auth-provider"

const stats = [
  {
    label: "پلتفرم‌های فعال",
    value: "۰",
    hint: "آماده ساخت اولین پلتفرم",
    icon: LayersIcon,
  },
  {
    label: "سفارشات جاری",
    value: "۰",
    hint: "هنوز سفارشی ثبت نشده",
    icon: ShoppingBagIcon,
  },
  {
    label: "وضعیت حساب",
    value: "فعال",
    hint: "دسترسی کامل به پنل",
    icon: SparklesIcon,
  },
]

export function DashboardHomePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const mobile = user.mobileNumber ?? user.username

  return (
    <div className="flex flex-col gap-6">
      <section className="flex justify-end">
        <Button className="w-full font-normal sm:w-auto">
          <SparklesIcon data-icon="inline-start" />
          ساخت پلتفرم جدید
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 bg-card/80 shadow-sm"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="flex flex-col gap-1">
                <CardDescription className="text-xs font-light">
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-2xl font-medium tabular-nums">
                  {stat.value}
                </CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-light text-muted-foreground">
                {stat.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              شروع سریع
            </CardTitle>
            <CardDescription className="font-light">
              چند قدم تا راه‌اندازی اولین پلتفرم شما
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              "پروفایل خود را در تنظیمات تکمیل کنید",
              "اولین پلتفرم را بسازید",
              "در صورت نیاز با پشتیبانی در تماس باشید",
            ].map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-background text-xs font-medium text-primary tabular-nums">
                  {index + 1}
                </span>
                <p className="text-sm font-light text-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-medium">وضعیت حساب</CardTitle>
            <CardDescription className="font-light">
              خلاصه اطلاعات ورود شما
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-light text-muted-foreground">
                شماره موبایل / نام کاربری
              </span>
              <span dir="ltr" className="text-sm font-normal tabular-nums">
                {mobile}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-light text-muted-foreground">
                وضعیت
              </span>
              <Badge variant="secondary" className="font-normal">
                فعال
              </Badge>
            </div>
            <Button
              variant="outline"
              className="mt-1 w-full font-normal"
              render={<Link to="/dashboard/settings" />}
            >
              مشاهده تنظیمات
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
