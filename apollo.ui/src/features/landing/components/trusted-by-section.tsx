import { Container } from "@/components/shared/container"

import { trustedCompanies } from "../data/trusted-companies"

export function TrustedBySection() {
  return (
    <section className="border-y bg-muted/30">
      <Container className="flex flex-col items-center gap-6 py-10">
        <p className="text-sm text-muted-foreground">
          تیم‌های پیشرو با آپولو می‌سازند
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustedCompanies.map((company) => (
            <li
              key={company}
              className="text-lg font-semibold text-muted-foreground/60"
            >
              {company}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
