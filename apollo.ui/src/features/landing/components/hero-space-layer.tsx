import { meteors, spaceDust, starFieldDeep, starFieldMid } from "../data/hero-space"
import { cn } from "@/lib/utils"

export function HeroSpaceLayer() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-[-20%] motion-safe:animate-hero-nebula-drift opacity-60">
        <div className="absolute top-[10%] right-[15%] size-96 rounded bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[10%] size-80 rounded bg-primary-soft/15 blur-[100px]" />
        <div className="absolute top-[45%] left-[40%] size-64 rounded bg-primary/10 blur-[90px]" />
      </div>

      <StarLayer
        stars={starFieldDeep}
        className="motion-safe:animate-hero-star-drift-slow opacity-50"
      />
      <StarLayer
        stars={starFieldMid}
        className="motion-safe:animate-hero-star-drift-fast opacity-70"
      />

      {spaceDust.map((particle, index) => (
        <span
          key={`dust-${index}`}
          className="absolute size-px rounded bg-primary/40 motion-safe:animate-hero-dust"
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      {meteors.map((meteor, index) => (
        <span
          key={`meteor-${index}`}
          className="absolute end-0 h-px origin-right motion-safe:animate-hero-meteor bg-linear-to-r from-white/90 via-primary/70 to-transparent shadow-[0_0_10px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]"
          style={{
            top: meteor.top,
            width: meteor.width,
            animationDelay: meteor.delay,
            animationDuration: meteor.duration,
          }}
        />
      ))}
    </div>
  )
}

function StarLayer({
  stars,
  className,
}: {
  stars: typeof starFieldDeep
  className?: string
}) {
  return (
    <div className={cn("absolute inset-0", className)}>
      {stars.map((star, index) => (
        <span
          key={`star-${index}`}
          className={cn(
            "absolute rounded bg-white/90",
            star.drift
              ? "motion-safe:animate-hero-star-float"
              : "motion-safe:animate-hero-twinkle"
          )}
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  )
}
