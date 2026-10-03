"use client";

import Link from "next/link";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import type { BrandRow } from "./data";
import { BrandsRowActions } from "./brands-row-actions";

export function createBrandsColumns(
  onDelete: (id: string) => void,
  onToggleActive: (brand: BrandRow) => void,
): LegacyColumnDef<BrandRow>[] {
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
      meta: { className: "w-12 text-center" },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="نام"
          className="w-full justify-start"
        />
      ),
      cell: ({ row }) => {
        const brand = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
              {brand.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.imagePath}
                  alt=""
                  className="size-full object-contain"
                />
              ) : (
                <Award className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 text-start">
              <Link
                href={`/admin/brands/${brand.id}`}
                className="block truncate font-medium text-foreground hover:text-primary hover:underline"
              >
                {brand.name}
              </Link>
              {brand.description ? (
                <div className="truncate text-xs text-muted-foreground">
                  {brand.description}
                </div>
              ) : null}
            </div>
          </div>
        );
      },
      filterFn: (row, _id, value: string) => {
        const q = value.trim().toLowerCase();
        if (!q) return true;
        const brand = row.original;
        return (
          brand.name.toLowerCase().includes(q) ||
          brand.slug.toLowerCase().includes(q) ||
          (brand.description?.toLowerCase().includes(q) ?? false)
        );
      },
      enableHiding: false,
      meta: { className: "min-w-[14rem] text-start" },
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="اسلاگ"
          className="w-full justify-center"
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground" dir="ltr">
          {row.original.slug}
        </span>
      ),
      meta: { className: "w-40 text-center" },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="وضعیت"
          className="w-full justify-center"
        />
      ),
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <div className="flex justify-center">
            <Badge variant={active ? "success" : "danger"}>
              {active ? "فعال" : "غیرفعال"}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) =>
        value.includes(String(row.getValue(id))),
      meta: { className: "w-28 text-center" },
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <BrandsRowActions
          row={row}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-14 pe-3 text-center" },
    },
  ];
}
