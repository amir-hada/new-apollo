import type { MetadataRoute } from "next";
import { serverFetch } from "@/lib/server-api";
import type { BlogPostListItem, PagedResult, ProductListItem } from "@/types/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await serverFetch<PagedResult<ProductListItem>>("/api/products?page=1&pageSize=100");
  const posts = await serverFetch<PagedResult<BlogPostListItem>>("/api/blog/posts?page=1&pageSize=100");

  const staticRoutes: MetadataRoute.Sitemap = ["", "/products", "/blog", "/faq", "/login"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const productRoutes =
    products?.items?.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })) ?? [];

  const blogRoutes =
    posts?.items?.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.publishedAtUtc ? new Date(p.publishedAtUtc) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })) ?? [];

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
