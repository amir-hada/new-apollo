import { Container } from "@/components/shared/container"
import { SectionHeading } from "@/components/shared/section-heading"

import { steps, type Step } from "../data/steps"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/30">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="نحوه کار"
          title="از ایده تا انتشار، در سه گام"
          description="مسیر ساخت پلتفرم در آپولو آن‌قدر ساده است که اولین نسخه را همین امروز منتشر می‌کنید."
        />
        <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <StepItem
              key={step.title}
              step={step}
              order={index + 1}
              isLast={index === steps.length - 1}
            />
          ))}
        </ol>
      </Container>
    </section>
  )
}

function StepItem({
  step,
  order,
  isLast,
}: {
  step: Step
  order: number
  isLast: boolean
}) {
  const Icon = step.icon

  return (
    <li className="relative flex flex-col items-center gap-4 text-center">
      {!isLast && (
        <div
          aria-hidden
          className="absolute -end-1/2 top-6 hidden w-full border-t border-dashed border-border md:block"
        />
      )}
      <div className="relative flex size-12 items-center justify-center rounded bg-primary font-heading text-lg font-semibold text-primary-foreground">
        {order.toLocaleString("fa-IR")}
      </div>
      <div className="flex items-center gap-2">
        <Icon aria-hidden className="size-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
      </div>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </li>
  )
}
