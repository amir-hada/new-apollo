import { Container } from "@/components/shared/container"
import { SectionHeading } from "@/components/shared/section-heading"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { faqItems } from "../data/faq-items"

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20">
      <Container className="flex max-w-3xl flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          eyebrow="سوالات متداول"
          title="پاسخ سوالات شما"
          description="اگر پاسخ سوال خود را پیدا نکردید، تیم پشتیبانی ما شبانه‌روزی در کنار شماست."
        />
        <Accordion multiple={false} className="gap-3">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded border bg-card px-5"
            >
              <AccordionTrigger className="py-4 text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-base leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  )
}
