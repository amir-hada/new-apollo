import {
  ChevronDownIcon,
  CreditCardIcon,
  HeadsetIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { HeroAmbientBackground } from "./hero-ambient-background"
import { HeroNavbar } from "./hero-navbar"
import { stats } from "../data/stats"

const heroHighlights = [
  { label: "پرداخت اقساطی", icon: CreditCardIcon },
  { label: "ضمانت بازگشت وجه", icon: ShieldCheckIcon },
  { label: "پشتیبانی شبانه‌روزی", icon: HeadsetIcon },
] as const

const accentTextClass =
  "bg-linear-to-l from-primary via-primary-soft to-primary bg-clip-text text-transparent"

export function HeroSection() {
  return (
    <>
      <HeroNavbar />

      <section className="relative min-h-svh overflow-hidden">
        <HeroAmbientBackground />

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pt-16 sm:px-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center lg:py-20">
            <Badge
              variant="outline"
              className="motion-safe:animate-hero-fade-up h-auto border-primary/30 bg-primary/5 px-3 py-1 text-xs font-normal [animation-delay:0ms]"
            >
              آپولو نسخه ۱.۰.۰۱
            </Badge>

            <h1 className="max-w-4xl font-heading text-4xl leading-[1.35] font-semibold text-balance sm:text-5xl sm:leading-[1.32] lg:text-[3.25rem] lg:leading-[1.28]">
              <span className="motion-safe:animate-hero-fade-up inline-block [animation-delay:80ms]">
                با{" "}
                <span className={accentTextClass}>آپولو</span> در
              </span>
              <span className="motion-safe:animate-hero-fade-up inline-block [animation-delay:160ms]">
                {" "}
                کمتر از{" "}
              </span>
              <span
                className={`motion-safe:animate-hero-fade-up inline-block whitespace-nowrap [animation-delay:200ms] ${accentTextClass}`}
              >
                ۱۰ دقیقه
              </span>
              <span className="motion-safe:animate-hero-fade-up inline-block [animation-delay:240ms]">
                {" "}
                پلتفرم خود را طراحی و پیاده‌سازی کنید
              </span>
            </h1>

            <p className="motion-safe:animate-hero-fade-up max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg sm:leading-relaxed [animation-delay:320ms]">
              بدون دردسرهای فنی، ساده، سریع و مقرون‌به‌صرفه ایده‌هایتان را به
              پلتفرم‌های کاربردی و پویا تبدیل کنید. از ایده خام تا محصول نهایی،
              فقط چند کلیک فاصله دارید.
            </p>

            <div className="motion-safe:animate-hero-fade-up flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row [animation-delay:400ms]">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 font-normal"
              >
                نمونه کارها
              </Button>
              <Button
                size="lg"
                className="h-11 px-6 font-normal shadow-lg shadow-primary/25"
              >
                شروع کنید
              </Button>
            </div>

            <ul className="motion-safe:animate-hero-fade-up flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground [animation-delay:480ms]">
              {heroHighlights.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon aria-hidden className="size-4 text-primary" />
                  {label}
                </li>
              ))}
            </ul>

            <dl className="motion-safe:animate-hero-fade-up grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-border/50 pt-10 sm:gap-x-8 lg:grid-cols-4 [animation-delay:560ms]">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <dt className="font-heading text-2xl font-semibold text-white sm:text-3xl">
                    {stat.value}
                  </dt>
                  <dd className="text-xs text-muted-foreground sm:text-sm">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <a
            href="#features"
            aria-label="رفتن به بخش ویژگی‌ها"
            className="motion-safe:animate-hero-fade-up mb-8 flex justify-center text-muted-foreground transition-colors hover:text-foreground [animation-delay:640ms]"
          >
            <ChevronDownIcon className="motion-safe:animate-hero-bounce size-6" />
          </a>
        </div>
      </section>
    </>
  )
}
