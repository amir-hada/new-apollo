import type { Brand } from "@/types/api";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imagePath?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
};

export function mapBrand(brand: Brand): BrandRow {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    imagePath: brand.imagePath,
    isActive: brand.isActive,
    createdAtUtc: brand.createdAtUtc,
    updatedAtUtc: brand.updatedAtUtc,
  };
}
