"use client";

import { use } from "react";
import { ProductsListing } from "@/features/products/ProductsListing";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ProductsListing routeCategorySlug={slug} />;
}
