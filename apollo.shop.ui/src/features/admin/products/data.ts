import type { ProductListItem, ProductStatus } from "@/types/api";

export type ProductRow = ProductListItem & {
  category: string;
  totalSales: number;
  totalRevenue: number;
  trend: number[];
};

export function mapProductRow(item: ProductListItem): ProductRow {
  const trendSource = item.revenueTrend?.length
    ? item.revenueTrend
    : Array.from({ length: 12 }, () => 0);

  return {
    ...item,
    category: item.categoryName?.trim() || item.brandName?.trim() || "عمومی",
    totalSales: item.totalSales ?? 0,
    totalRevenue: item.totalRevenue ?? 0,
    trend: trendSource.map((value) => Number(value) || 0),
  };
}

export const productStatusOptions: {
  label: string;
  value: string;
  status: ProductStatus;
}[] = [
  { label: "پیش‌نویس", value: "0", status: 0 },
  { label: "منتشرشده", value: "1", status: 1 },
  { label: "آرشیو", value: "2", status: 2 },
];
