"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { useSiteSettings } from "@/lib/use-site-settings";
import type { ProductListItem } from "@/types/api";

export function HomeHero({ products }: { products: ProductListItem[] }) {
  const { settings } = useSiteSettings();
  const home = settings.home;

  return (
    <div>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 md:py-24">
          {home.eyebrow && <p className="text-sm font-medium text-primary">{home.eyebrow}</p>}
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {home.title}
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
            {home.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={home.primaryCtaHref || "/products"}>
              <Button size="lg">{home.primaryCtaLabel}</Button>
            </Link>
            <Link href={home.secondaryCtaHref || "/blog"}>
              <Button size="lg" variant="outline">
                {home.secondaryCtaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-10 sm:px-4 sm:py-12 lg:px-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">{home.featuredTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{home.featuredSubtitle}</p>
            </div>
            <Link href="/products" className="text-sm text-primary hover:underline">
              همه محصولات
            </Link>
          </div>
          {products.length ? (
            <ProductGrid>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
              هنوز محصولی برای نمایش وجود ندارد. API را اجرا کنید تا داده‌ها بارگذاری شوند.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
