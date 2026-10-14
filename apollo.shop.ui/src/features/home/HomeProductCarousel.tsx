"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/types/api";

type HomeProductCarouselProps = {
  title: string;
  subtitle?: string;
  href: string;
  products: ProductListItem[];
  className?: string;
};

export function HomeProductCarousel({
  title,
  subtitle,
  href,
  products,
  className,
}: HomeProductCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.75, 560);
    el.scrollBy({ left: dir * amount * -1, behavior: "smooth" });
  };

  return (
    <section className={cn("w-full bg-background", className)}>
      <div className="w-full py-8 sm:py-10">
        <div className="mb-4 flex items-end justify-between gap-4 px-3 sm:mb-5 sm:px-4 lg:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold sm:text-2xl">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href={href}
            className="shrink-0 text-sm text-primary hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        <div className="relative w-full">
          <button
            type="button"
            aria-label="اسکرول به راست"
            onClick={() => scrollBy(-1)}
            className="absolute start-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-md border border-[#e0e0e2] bg-background text-[#3f4064] shadow-md transition hover:bg-muted md:flex dark:border-white/10 dark:text-foreground"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="اسکرول به چپ"
            onClick={() => scrollBy(1)}
            className="absolute end-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-md border border-[#e0e0e2] bg-background text-[#3f4064] shadow-md transition hover:bg-muted md:flex dark:border-white/10 dark:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            ref={scrollerRef}
            className={cn(
              "flex w-full overflow-x-auto border-y border-[#e0e0e2] dark:border-white/10",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className={cn(
                  "w-[46%] shrink-0 sm:w-[33.333%] md:w-[25%] lg:w-[16.666%] xl:w-[14.285%] 2xl:w-[12.5%]",
                  index === products.length - 1 && "[&>a]:border-e-0",
                )}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
