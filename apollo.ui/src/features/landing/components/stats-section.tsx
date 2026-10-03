import { Container } from "@/components/shared/container"

import { stats } from "../data/stats"

export function StatsSection() {
  return (
    <section>
      <Container className="grid grid-cols-2 gap-x-4 gap-y-10 py-16 sm:py-20 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span className="font-heading text-3xl font-semibold text-primary sm:text-4xl">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </Container>
    </section>
  )
}
