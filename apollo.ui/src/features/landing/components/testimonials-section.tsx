import { StarIcon } from "lucide-react"

import { Container } from "@/components/shared/container"
import { SectionHeading } from "@/components/shared/section-heading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

import { testimonials, type Testimonial } from "../data/testimonials"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-20 border-y bg-muted/30">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="نظرات کاربران"
          title="سازندگان، آپولو را انتخاب کرده‌اند"
          description="از استارتاپ‌های نوپا تا تیم‌های باتجربه؛ ببینید دیگران با آپولو چه ساخته‌اند."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </Container>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div aria-label="امتیاز ۵ از ۵" className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <StarIcon
              key={index}
              aria-hidden
              className="size-3.5 fill-primary text-primary"
            />
          ))}
        </div>
        <blockquote className="leading-relaxed text-pretty">
          «{testimonial.quote}»
        </blockquote>
      </CardContent>
      <CardFooter className="gap-3">
        <Avatar>
          <AvatarFallback>{testimonial.initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{testimonial.name}</span>
          <span className="text-xs text-muted-foreground">
            {testimonial.role}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
