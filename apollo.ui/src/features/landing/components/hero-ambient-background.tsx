import { HeroSpaceLayer } from "./hero-space-layer"

export function HeroAmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <HeroSpaceLayer />

      <div className="absolute inset-0 bg-dot-grid opacity-15 [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,#000_20%,transparent_75%)]" />

      <div className="absolute -top-32 right-[10%] size-[28rem] rounded bg-primary/20 blur-[100px] motion-safe:animate-hero-orb-1" />
      <div className="absolute top-[20%] left-[5%] size-80 rounded bg-primary-soft/15 blur-[90px] motion-safe:animate-hero-orb-2" />
      <div className="absolute bottom-[10%] right-[25%] size-64 rounded bg-primary/12 blur-[80px] motion-safe:animate-hero-orb-3" />

      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,var(--color-background)_90%)]" />
    </div>
  )
}
