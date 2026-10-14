"use client";

import Link from "next/link";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { resolveProductImageUrl } from "@/lib/product-image";
import { formatPrice } from "@/lib/utils";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import type { ProductRow } from "./data";
import { ProductsRowActions } from "./products-row-actions";

export function createProductsColumns(
  onDelete: (id: string) => void,
): LegacyColumnDef<ProductRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected()
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="انتخاب همه"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="انتخاب ردیف"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-10 text-center" },
    },
    {
      id: "image",
      accessorKey: "primaryImageUrl",
      header: () => null,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-center">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveProductImageUrl(product.primaryImageUrl)}
                alt=""
                className="size-full object-cover"
              />
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-14 text-center" },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="نام" className="w-full justify-center" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="min-w-40 text-center">
            <Link
              href={`/admin/products/${product.id}`}
              className="block truncate font-medium text-foreground hover:text-primary hover:underline"
            >
              {product.name}
            </Link>
            <div className="truncate text-xs text-muted-foreground">
              {product.productCode}
              {product.sku ? ` · ${product.sku}` : null}
            </div>
          </div>
        );
      },
      filterFn: (row, _id, value: string) => {
        const q = value.trim().toLowerCase();
        if (!q) return true;
        const product = row.original;
        return (
          product.name.toLowerCase().includes(q) ||
          product.slug.toLowerCase().includes(q) ||
          product.productCode.toLowerCase().includes(q) ||
          (product.sku?.toLowerCase().includes(q) ?? false) ||
          (product.brandName?.toLowerCase().includes(q) ?? false) ||
          (product.categoryName?.toLowerCase().includes(q) ?? false)
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "basePrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="قیمت" className="w-full justify-center" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const hasDiscount =
          product.discountPrice != null &&
          product.discountPrice > 0 &&
          product.discountPrice < product.basePrice;

        if (hasDiscount) {
          return (
            <div className="flex flex-col items-center gap-0.5 tabular-nums leading-tight">
              <span className="text-sm font-medium">
                {formatPrice(product.discountPrice!)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.basePrice)}
              </span>
            </div>
          );
        }

        return (
          <span className="tabular-nums text-sm">
            {formatPrice(product.basePrice)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="وضعیت" className="w-full justify-center" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const label =
          status === 1 ? "منتشرشده" : status === 2 ? "آرشیو" : "پیش‌نویس";
        const variant =
          status === 1 ? "success" : status === 2 ? "secondary" : "danger";
        return (
          <div className="flex justify-center">
            <Badge variant={variant}>{label}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "totalSales",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="فروش کل" className="w-full justify-center" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {toPersianDigits(row.original.totalSales.toLocaleString("en-US"))}
        </span>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="درآمد کل" className="w-full justify-center" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {formatPrice(row.original.totalRevenue)}
        </span>
      ),
    },
    {
      id: "category",
      accessorKey: "category",
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProductsRowActions row={row} onDelete={onDelete} />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-14 pe-3" },
    },
  ];
}
