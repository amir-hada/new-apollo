import { useScrollRestoration } from "@/hooks/use-scroll-restoration"

import { FaqSection } from "./components/faq-section"
import { FeaturesSection } from "./components/features-section"
import { FinalCtaSection } from "./components/final-cta-section"
import { HeroSection } from "./components/hero-section"
import { HowItWorksSection } from "./components/how-it-works-section"
import { LandingFooter } from "./components/landing-footer"
import { PlansSection } from "./components/plans-section"
import { StatsSection } from "./components/stats-section"
import { TestimonialsSection } from "./components/testimonials-section"
import { TrustedBySection } from "./components/trusted-by-section"

export function LandingPage() {
  useScrollRestoration()

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <PlansSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
