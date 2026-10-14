import type { Metadata } from "next";
import {
  HomeHero,
  type HomeCarouselRow,
} from "@/features/home/HomeHero";
import { serverFetch } from "@/lib/server-api";
import type { CategoryTree, PagedResult, ProductListItem } from "@/types/api";

export const metadata: Metadata = {
  title: "خانه",
  description: "فروشگاه آپولو — محصولات منتخب و تجربه خرید حرفه‌ای.",
};

function pickTopCategories(tree: CategoryTree[], count: number) {
  return tree
    .filter((c) => c.isActive)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fa"),
    )
    .slice(0, count);
}

export default async function HomePage() {
  const categories =
    (await serverFetch<CategoryTree[]>("/api/categories/tree")) ?? [];
  const topCategories = pickTopCategories(categories, 2);

  const [featured, bestSelling, newest, ...categoryPages] = await Promise.all([
    serverFetch<PagedResult<ProductListItem>>(
      "/api/products?page=1&pageSize=12&sort=featured",
    ),
    serverFetch<PagedResult<ProductListItem>>(
      "/api/products?page=1&pageSize=12&sort=best_selling",
    ),
    serverFetch<PagedResult<ProductListItem>>(
      "/api/products?page=1&pageSize=12&sort=newest",
    ),
    ...topCategories.map((cat) =>
      serverFetch<PagedResult<ProductListItem>>(
        `/api/products?page=1&pageSize=12&categorySlug=${encodeURIComponent(cat.slug)}&sort=newest`,
      ),
    ),
  ]);

  const carousels: HomeCarouselRow[] = [
    {
      key: "best-selling",
      title: "پرفروش‌ترین‌ها",
      subtitle: "محبوب‌ترین کالاهای فروشگاه",
      href: "/products?sort=best_selling",
      products: bestSelling?.items ?? [],
    },
    {
      key: "newest",
      title: "جدیدترین‌ها",
      subtitle: "تازه‌واردهای فروشگاه",
      href: "/products?sort=newest",
      products: newest?.items ?? [],
    },
    ...topCategories.map((cat, index) => ({
      key: `cat-${cat.id}`,
      title: cat.name,
      subtitle: cat.description?.trim() || undefined,
      href: `/categories/${cat.slug}`,
      products: categoryPages[index]?.items ?? [],
    })),
  ];

  return (
    <HomeHero
      products={featured?.items ?? []}
      amazingProducts={featured?.items ?? []}
      carousels={carousels}
    />
  );
}
