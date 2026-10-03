import { Container } from "@/components/shared/container"
import { SectionHeading } from "@/components/shared/section-heading"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { features, type Feature } from "../data/features"

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="ویژگی‌ها"
          title="هر آنچه برای ساخت پلتفرم نیاز دارید، یکجا"
          description="از طراحی تا انتشار و تحلیل؛ آپولو تمام ابزارها را در یک محیط یکپارچه کنار هم گذاشته است."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon

  return (
    <Card className="transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
          <Icon aria-hidden className="size-5" />
        </div>
        <CardTitle>{feature.title}</CardTitle>
        <CardDescription className="leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
