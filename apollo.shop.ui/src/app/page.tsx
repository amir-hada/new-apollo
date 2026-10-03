import type { Metadata } from "next";
import { HomeHero } from "@/features/home/HomeHero";
import { serverFetch } from "@/lib/server-api";
import type { PagedResult, ProductListItem } from "@/types/api";

export const metadata: Metadata = {
  title: "خانه",
  description: "فروشگاه آپولو — محصولات منتخب و تجربه خرید حرفه‌ای.",
};

export default async function HomePage() {
  const products = await serverFetch<PagedResult<ProductListItem>>(
    "/api/products?page=1&pageSize=8&sort=newest",
  );

  return <HomeHero products={products?.items ?? []} />;
}
