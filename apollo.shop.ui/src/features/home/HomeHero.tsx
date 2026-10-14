"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AmazingOffers } from "@/features/home/AmazingOffers";
import { HomeProductCarousel } from "@/features/home/HomeProductCarousel";
import { HomeStories } from "@/features/home/HomeStories";
import { useShopSettings } from "@/lib/shop-settings-api";
import { useSiteSettings } from "@/lib/use-site-settings";
import { cn } from "@/lib/utils";
import type { HeroBanner, ProductListItem } from "@/types/api";

export type HomeCarouselRow = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  products: ProductListItem[];
};

function HeroBannerSlider({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;

  const goTo = useCallback(
    (next: number) => {
      if (count <= 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    setIndex(0);
  }, [banners]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => goTo(index + 1), 5000);
    return () => window.clearInterval(timer);
  }, [count, goTo, index]);

  if (count === 0) return null;

  return (
    <section className="w-full">
      <div className="group relative overflow-hidden bg-[#e0e0e2] dark:bg-muted">
        <div
          dir="ltr"
          className="flex h-[170px] transition-transform duration-500 ease-out sm:h-[230px] md:h-[290px] lg:h-[330px]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner, i) => {
            const image = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.imageUrl}
                alt=""
                className="absolute inset-0 size-full object-cover object-center"
                draggable={false}
              />
            );

            return (
              <div
                key={banner.id || `${banner.imageUrl}-${i}`}
                className="relative h-full w-full shrink-0"
              >
                {banner.linkUrl ? (
                  <Link href={banner.linkUrl} className="absolute inset-0 block">
                    {image}
                  </Link>
                ) : (
                  image
                )}
              </div>
            );
          })}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="اسلاید قبلی"
              onClick={() => goTo(index - 1)}
              className="absolute start-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-[#424750] opacity-100 shadow-md transition hover:bg-white sm:start-3 sm:size-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronRight className="size-5 sm:size-6" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="اسلاید بعدی"
              onClick={() => goTo(index + 1)}
              className="absolute end-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-[#424750] opacity-100 shadow-md transition hover:bg-white sm:end-3 sm:size-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5 sm:size-6" strokeWidth={1.75} />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5 sm:bottom-3">
              {banners.map((banner, i) => (
                <button
                  key={banner.id || i}
                  type="button"
                  aria-label={`اسلاید ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "pointer-events-auto h-1.5 rounded-full transition-all sm:h-2",
                    i === index
                      ? "w-4 bg-[#424750] sm:w-5"
                      : "w-1.5 bg-white/80 hover:bg-white sm:w-2",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function HomeHero({
  products,
  amazingProducts = [],
  carousels = [],
}: {
  products: ProductListItem[];
  amazingProducts?: ProductListItem[];
  carousels?: HomeCarouselRow[];
}) {
  const { settings } = useSiteSettings();
  const { data: shop } = useShopSettings();
  const home = settings.home;
  const banners = (shop?.heroBanners ?? []).filter((b) => !!b.imageUrl);
  const stories = (shop?.homeStories ?? []).filter((s) => !!s.imageUrl);

  return (
    <div>
      <HeroBannerSlider banners={banners} />
      <HomeStories stories={stories} />
      <AmazingOffers products={amazingProducts} />

      <HomeProductCarousel
        title={home.featuredTitle}
        subtitle={home.featuredSubtitle}
        href="/products?sort=featured"
        products={products}
      />

      {carousels.map((row) => (
        <HomeProductCarousel
          key={row.key}
          title={row.title}
          subtitle={row.subtitle}
          href={row.href}
          products={row.products}
        />
      ))}
    </div>
  );
}
