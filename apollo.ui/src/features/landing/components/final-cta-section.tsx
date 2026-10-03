import { ArrowLeftIcon } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section>
      <Container className="pb-20 sm:pb-24">
        <div className="relative overflow-hidden rounded bg-linear-to-l from-primary via-primary to-primary-soft px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="absolute -start-24 -top-24 size-64 rounded bg-primary-foreground/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -end-24 -bottom-24 size-64 rounded bg-primary-foreground/10 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-6">
            <h2 className="max-w-2xl font-heading text-3xl leading-normal font-semibold text-balance text-primary-foreground sm:text-4xl sm:leading-normal">
              آماده‌اید پلتفرم بعدی خود را بسازید؟
            </h2>
            <p className="max-w-xl leading-relaxed text-pretty text-primary-foreground/85">
              همین حالا رایگان شروع کنید؛ ۱۰ دقیقه دیگر پلتفرم شما آنلاین است.
            </p>
            <Button size="lg" variant="secondary" className="h-11 px-6">
              شروع رایگان
              <ArrowLeftIcon data-icon="inline-end" />
            </Button>
            <span className="text-sm text-primary-foreground/75">
              بدون نیاز به کارت بانکی
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}
