import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: "center" | "start"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-sm font-normal text-primary">{eyebrow}</span>
      )}
      <h2 className="max-w-2xl font-heading text-3xl leading-normal font-semibold text-balance sm:text-4xl sm:leading-normal">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg sm:leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
