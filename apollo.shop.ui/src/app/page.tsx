import type { Metadata } from "next";
import { HomeHero } from "@/features/home/HomeHero";
import { serverFetch } from "@/lib/server-api";
import type { PagedResult, ProductListItem } from "@/types/api";

export const metadata: Metadata = {
  title: "خانه",
  description: "فروشگاه آپولو — محصولات منتخب و تجربه خرید حرفه‌ای.",
};

export default async function HomePage() {
  const [products, amazing] = await Promise.all([
    serverFetch<PagedResult<ProductListItem>>(
      "/api/products?page=1&pageSize=8&sort=newest",
    ),
    serverFetch<PagedResult<ProductListItem>>(
      "/api/products?page=1&pageSize=12&sort=featured",
    ),
  ]);

  return (
    <HomeHero
      products={products?.items ?? []}
      amazingProducts={amazing?.items ?? []}
    />
  );
}
