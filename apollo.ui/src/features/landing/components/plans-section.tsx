import * as React from "react"
import { CheckIcon, ImageIcon, Loader2Icon, SparklesIcon } from "lucide-react"
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

function isFeaturedPlan(plan: PublicPlanListItem, plans: PublicPlanListItem[]) {
  if (plans.length < 3) return false
  const paid = plans
    .filter((item) => item.priceInToman > 0)
    .slice()
    .sort((a, b) => a.priceInToman - b.priceInToman)
  if (paid.length === 0) return false
  const mid = paid[Math.floor((paid.length - 1) / 2)]
  return mid?.planId === plan.planId
}

function PlanHero({
  src,
  alt,
  featured,
}: {
  src: string | null
  alt: string
  featured: boolean
}) {
  const [failed, setFailed] = React.useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_50%,color-mix(in_oklch,var(--primary-soft)_10%,transparent))]" />
          <ImageIcon className="relative size-10 text-white/20" />
        </div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--card)_0%,color-mix(in_oklch,var(--card)_88%,transparent)_22%,color-mix(in_oklch,var(--card)_40%,transparent)_55%,transparent_100%)]"
      />

      {featured ? (
        <div className="absolute start-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-primary/35 bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-md">
          <SparklesIcon className="size-3.5" aria-hidden />
          پیشنهاد ویژه
        </div>
      ) : null}
    </div>
  )
}

function PlanPrice({ plan }: { plan: PublicPlanListItem }) {
  const isFree = plan.priceInToman === 0
  const hasDiscount =
    plan.discountedPriceInToman !== null &&
    plan.discountedPriceInToman < plan.priceInToman
  const discountPercent = hasDiscount
    ? getDiscountPercent(plan.priceInToman, plan.discountedPriceInToman!)
    : null

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      {isFree ? (
        <p className="font-heading text-3xl font-semibold tracking-tight text-emerald-300 sm:text-[2rem]">
          رایگان
        </p>
      ) : hasDiscount ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <p className="text-sm text-white/35 line-through decoration-white/35">
              {formatPrice(plan.priceInToman)}
            </p>
            {discountPercent ? (
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/20">
                {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
              </span>
            ) : null}
          </div>
          <p className="font-heading text-3xl font-semibold tracking-tight text-emerald-300 sm:text-[2rem]">
            {formatPrice(plan.discountedPriceInToman!)}
            <span className="ms-1.5 text-base font-normal text-emerald-300/75">
              تومان
            </span>
          </p>
        </>
      ) : (
        <p className="font-heading text-3xl font-semibold tracking-tight text-emerald-300 sm:text-[2rem]">
          {formatPrice(plan.priceInToman)}
          <span className="ms-1.5 text-base font-normal text-emerald-300/75">
            تومان
          </span>
        </p>
      )}
      <p className="text-xs tracking-wide text-muted-foreground">
        {isFree ? "بدون محدودیت زمانی" : getBillingPeriodLabel(plan.billingPeriod)}
      </p>
    </div>
  )
}

function PlanPropertiesList({
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
    <ul className="flex flex-col gap-2.5">
      {properties.map((property, index) => (
        <li
          key={`${property.title}-${index}`}
          className="flex items-start gap-2.5 rounded-md bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]"
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary/15 text-primary">
            <CheckIcon className="size-3" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[11px] text-muted-foreground">{property.title}</p>
            <p className="text-sm leading-snug text-foreground">{property.value}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function PlanPanel({
  plan,
  delay,
  featured,
}: {
  plan: PublicPlanListItem
  delay: number
  featured: boolean
}) {
  const isAvailable = plan.isAvailable

  return (
    <article
      className={cn(
        "group motion-safe:animate-hero-fade-up relative h-full",
        featured && "xl:z-10 xl:-my-2"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-xl bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_55%,transparent),transparent_40%,color-mix(in_oklch,var(--primary-soft)_35%,transparent))] opacity-90 blur-[1px]"
        />
      ) : null}

      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl",
          "border bg-card/90 backdrop-blur-sm",
          "transition-[transform,box-shadow,border-color] duration-500 ease-out",
          "hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
          featured
            ? "border-primary/40 shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_0_1px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
            : "border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.22)] hover:border-white/20"
        )}
      >
        <PlanHero src={plan.imageUrl} alt={plan.name} featured={featured} />

        <div className="relative z-10 -mt-14 flex flex-1 flex-col gap-5 px-5 pt-5 pb-5">
          <header className="space-y-2 text-center">
            <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
              {plan.name}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {plan.description}
            </p>
          </header>

          <PlanPrice plan={plan} />

          <div className="h-px w-full bg-linear-to-l from-transparent via-white/12 to-transparent" />

          <PlanPropertiesList properties={plan.properties} />

          {plan.allowsInstallment ? (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-md bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]">
              <p className="text-[11px] text-muted-foreground">خرید اقساطی با</p>
              <div className="flex items-center gap-1.5">
                {loanPartners.map((partner) => (
                  <img
                    key={partner.alt}
                    src={partner.src}
                    alt={partner.alt}
                    className="size-7 rounded-md object-cover ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-2.5 pt-1">
            {isAvailable ? (
              <Button
                size="lg"
                className={cn(
                  "h-11 w-full rounded-lg font-normal text-primary-foreground",
                  "bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90",
                  featured && "shadow-primary/40"
                )}
                render={<Link to="/auth" />}
              >
                شروع با ۷۲ ساعت تست رایگان
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="h-11 w-full rounded-lg border-0 bg-zinc-600 font-normal text-white hover:bg-zinc-600 disabled:opacity-100"
              >
                به زودی
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full rounded-lg border-white/12 bg-transparent font-normal text-foreground hover:border-white/20 hover:bg-white/[0.04] hover:text-foreground"
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
          className="overflow-hidden rounded-xl border border-white/10"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 bg-card p-5">
            <Skeleton className="mx-auto h-6 w-40" />
            <Skeleton className="mx-auto h-4 w-56" />
            <Skeleton className="mx-auto h-10 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function BillingPeriodToggle({
  value,
  onChange,
}: {
  value: "Monthly" | "Yearly"
  onChange: (next: "Monthly" | "Yearly") => void
}) {
  return (
    <div className="flex justify-center">
      <div
        role="group"
        aria-label="مدت اشتراک"
        className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        {(
          [
            { value: "Monthly" as const, label: "ماهانه" },
            { value: "Yearly" as const, label: "سالانه", hint: "صرفه‌جویی بیشتر" },
          ] as const
        ).map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "min-w-[7.5rem] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
              {"hint" in option && option.hint ? (
                <span
                  className={cn(
                    "ms-1.5 text-[11px]",
                    active ? "text-primary-foreground/80" : "text-emerald-300/90"
                  )}
                >
                  {option.hint}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PlansSection() {
  const [plans, setPlans] = React.useState<PublicPlanListItem[]>([])
  const [billingPeriod, setBillingPeriod] = React.useState<"Monthly" | "Yearly">(
    "Monthly"
  )
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

  const visiblePlans = React.useMemo(() => {
    return plans
      .filter(
        (plan) =>
          plan.billingPeriod === billingPeriod || plan.priceInToman === 0
      )
      .slice()
      .sort((a, b) => a.priceInToman - b.priceInToman)
  }, [plans, billingPeriod])

  const hasYearlyPlans = plans.some((plan) => plan.billingPeriod === "Yearly")

  return (
    <section id="plans" className="relative scroll-mt-20 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/4 start-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 end-0 size-72 rounded-full bg-primary-soft/10 blur-[100px]" />
      </div>

      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="پلن‌ها"
          title="از رایگان شروع کنید، هر وقت لازم بود ارتقا دهید"
          description="سه سطح ساده: پایه برای شروع، استاندارد برای فروش فعال، پیشرفته برای کسب‌وکار جدی — با انتخاب مدت ماهانه یا سالانه."
        />

        {!isLoading && !error && hasYearlyPlans ? (
          <BillingPeriodToggle
            value={billingPeriod}
            onChange={setBillingPeriod}
          />
        ) : null}

        {isLoading ? (
          <PlansLoadingState />
        ) : error ? (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : visiblePlans.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            در حال حاضر پلنی برای نمایش وجود ندارد.
          </p>
        ) : (
          <div
            className={cn(
              "grid items-stretch gap-6 lg:gap-7",
              visiblePlans.length === 1
                ? "mx-auto w-full max-w-md"
                : visiblePlans.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {visiblePlans.map((plan, index) => (
              <PlanPanel
                key={plan.planId}
                plan={plan}
                delay={index * 90}
                featured={isFeaturedPlan(plan, visiblePlans)}
              />
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
