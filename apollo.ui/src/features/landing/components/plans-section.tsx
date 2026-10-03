import * as React from "react"
import { ImageIcon, Loader2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import digipayLogo from "@/assets/loan-logo/digipay.jpeg"
import snappayLogo from "@/assets/loan-logo/snappay.jpeg"
import taraLogo from "@/assets/loan-logo/tara.png"
import { Container } from "@/components/shared/container"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { plansApi } from "@/lib/api/plans-api"
import type { PublicPlanListItem } from "@/lib/api/plan-types"
import { cn } from "@/lib/utils"

const loanPartners = [
  { src: snappayLogo, alt: "اسنپ‌پی" },
  { src: digipayLogo, alt: "دیجی‌پی" },
  { src: taraLogo, alt: "تارا" },
] as const

function formatPrice(value: number) {
  return value.toLocaleString("fa-IR")
}

function getBillingPeriodLabel(period: string) {
  return period === "Yearly" ? "سالانه" : "ماهانه"
}

function getDiscountPercent(price: number, discounted: number) {
  if (price <= 0 || discounted >= price) return null
  return Math.round(((price - discounted) / price) * 100)
}

function PlanHero({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) {
  const [failed, setFailed] = React.useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden bg-card">
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className="absolute inset-0 size-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <ImageIcon className="size-10 text-white/25" />
        </div>
      )}

      {/* Soft multi-stop fade into card — no hard seam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          backgroundImage:
            "linear-gradient(to top, var(--card) 0%, color-mix(in oklch, var(--card) 92%, transparent) 18%, color-mix(in oklch, var(--card) 72%, transparent) 36%, color-mix(in oklch, var(--card) 45%, transparent) 55%, color-mix(in oklch, var(--card) 18%, transparent) 75%, transparent 100%)",
        }}
      />
    </div>
  )
}

function PlanPrice({ plan }: { plan: PublicPlanListItem }) {
  const hasDiscount =
    plan.discountedPriceInToman !== null &&
    plan.discountedPriceInToman < plan.priceInToman
  const discountPercent = hasDiscount
    ? getDiscountPercent(plan.priceInToman, plan.discountedPriceInToman!)
    : null

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {hasDiscount ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <p className="text-sm text-red-400 line-through decoration-red-400/90">
              {formatPrice(plan.priceInToman)}
            </p>
            {discountPercent ? (
              <span className="rounded-[4px] bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300">
                {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
              </span>
            ) : null}
          </div>
          <p className="font-heading text-3xl font-semibold tracking-tight text-emerald-300">
            {formatPrice(plan.discountedPriceInToman!)}
            <span className="ms-1.5 text-base font-normal text-emerald-300/80">
              تومان
            </span>
          </p>
        </>
      ) : (
        <p className="font-heading text-3xl font-semibold tracking-tight text-emerald-300">
          {formatPrice(plan.priceInToman)}
          <span className="ms-1.5 text-base font-normal text-emerald-300/80">
            تومان
          </span>
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {getBillingPeriodLabel(plan.billingPeriod)}
      </p>
    </div>
  )
}

function PlanPropertiesTable({
  properties,
}: {
  properties: PublicPlanListItem["properties"]
}) {
  if (properties.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        ویژگی‌ای برای این پلن ثبت نشده است.
      </p>
    )
  }

  return (
    <table className="w-full border-collapse overflow-hidden rounded-[4px] border border-white/10 text-xs">
      <tbody>
        {properties.map((property, index) => (
          <tr
            key={`${property.title}-${index}`}
            className="border-b border-white/8 last:border-b-0"
          >
            <th
              scope="row"
              className="w-1/2 border-e border-white/8 bg-white/[0.04] px-2.5 py-2 text-center font-normal text-foreground"
            >
              {property.title}
            </th>
            <td className="w-1/2 px-2.5 py-2 text-center text-muted-foreground">
              {property.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PlanPanel({
  plan,
  delay,
}: {
  plan: PublicPlanListItem
  delay: number
}) {
  const isAvailable = plan.isAvailable

  return (
    <article
      className="motion-safe:animate-hero-fade-up h-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[4px]",
          "border border-white/12 bg-card",
          "shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
        )}
      >
        <PlanHero src={plan.imageUrl} alt={plan.name} />

        <div className="relative z-10 -mt-16 flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -top-16"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 0%, color-mix(in oklch, var(--card) 35%, transparent) 28%, color-mix(in oklch, var(--card) 85%, transparent) 55%, var(--card) 78%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[40%] bottom-0 bg-card"
          />

          <header className="relative z-10 space-y-2 text-center">
            <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
              {plan.name}
            </h3>
            <p className="truncate text-sm leading-6 text-muted-foreground">
              {plan.description}
            </p>
          </header>

          <div className="relative z-10">
            <PlanPrice plan={plan} />
          </div>

          <div className="relative z-10">
            <PlanPropertiesTable properties={plan.properties} />
          </div>

          {plan.allowsInstallment ? (
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-2">
              <p className="text-[11px] text-muted-foreground">خرید اقساطی با :</p>
              <div className="flex items-center gap-1.5">
                {loanPartners.map((partner) => (
                  <img
                    key={partner.alt}
                    src={partner.src}
                    alt={partner.alt}
                    className="size-7 rounded-[4px] object-cover ring-1 ring-white/10"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="relative z-10 mt-auto flex flex-col gap-2 pt-1">
            {isAvailable ? (
              <Button
                size="lg"
                className="h-10 w-full rounded-[4px] bg-primary font-normal text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                render={<Link to="/auth" />}
              >
                شروع با ۷۲ ساعت تست رایگان
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="h-10 w-full rounded-[4px] border-0 bg-zinc-600 font-normal text-white hover:bg-zinc-600 disabled:opacity-100"
              >
                به زودی
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="h-10 w-full rounded-[4px] border-white/15 bg-transparent font-normal text-foreground hover:bg-white/5 hover:text-foreground"
            >
              جزئیات بیشتر
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function PlansLoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[4px] border border-white/10"
        >
          <Skeleton className="aspect-[16/11] w-full rounded-none" />
          <div className="space-y-3 bg-card p-4">
            <Skeleton className="mx-auto h-6 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PlansSection() {
  const [plans, setPlans] = React.useState<PublicPlanListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadPlans() {
      setIsLoading(true)

      try {
        const result = await plansApi.getPlans()
        if (!cancelled) {
          setPlans(result)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setError("بارگذاری پلن‌ها ناموفق بود.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPlans()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="plans" className="scroll-mt-20">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="پلن‌ها"
          title="پلن مناسب کسب‌وکار خود را انتخاب کنید"
          description="پلن‌های آپولو با ویژگی‌ها و قیمت‌های شفاف؛ هر زمان بخواهید می‌توانید ارتقا دهید."
        />

        {isLoading ? (
          <PlansLoadingState />
        ) : error ? (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : plans.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            در حال حاضر پلنی برای نمایش وجود ندارد.
          </p>
        ) : (
          <div
            className={cn(
              "grid items-stretch gap-6 lg:gap-7",
              plans.length === 1
                ? "mx-auto w-full max-w-md"
                : plans.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {plans.map((plan, index) => (
              <PlanPanel key={plan.planId} plan={plan} delay={index * 90} />
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            در حال بارگذاری پلن‌ها
          </div>
        ) : null}
      </Container>
    </section>
  )
}
