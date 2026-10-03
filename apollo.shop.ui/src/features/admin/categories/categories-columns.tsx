"use client";

import Link from "next/link";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import type { CategoryRow } from "./data";
import { CategoriesRowActions } from "./categories-row-actions";

export function createCategoriesColumns(
  onDelete: (id: string) => void,
  onToggleActive: (category: CategoryRow) => void,
): LegacyColumnDef<CategoryRow>[] {
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="نام" className="w-full justify-center" />
      ),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div
            className="flex min-w-48 items-center justify-center gap-3"
            style={{ paddingInlineStart: `${category.depth * 16}px` }}
          >
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
              <FolderTree className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 text-center">
              <Link
                href={`/admin/categories/${category.id}`}
                className="block truncate font-medium text-foreground hover:text-primary hover:underline"
              >
                {category.name}
              </Link>
              {category.description ? (
                <div className="truncate text-xs text-muted-foreground">
                  {category.description}
                </div>
              ) : (
                <div className="truncate text-xs text-muted-foreground">
                  {category.slug}
                </div>
              )}
            </div>
          </div>
        );
      },
      filterFn: (row, _id, value: string) => {
        const q = value.trim().toLowerCase();
        if (!q) return true;
        const category = row.original;
        return (
          category.name.toLowerCase().includes(q) ||
          category.slug.toLowerCase().includes(q) ||
          (category.description?.toLowerCase().includes(q) ?? false) ||
          (category.parentName?.toLowerCase().includes(q) ?? false)
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="اسلاگ" className="w-full justify-center" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground" dir="ltr">
          {row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: "parentName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="دسته اصلی" className="w-full justify-center" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.parentName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="وضعیت" className="w-full justify-center" />
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
    },
    {
      accessorKey: "sortOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ترتیب" className="w-full justify-center" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {toPersianDigits(String(row.original.sortOrder))}
        </span>
      ),
    },
    {
      accessorKey: "childrenCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="زیرمجموعه" className="w-full justify-center" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">
          {toPersianDigits(String(row.original.childrenCount))}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CategoriesRowActions
          row={row}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-14 pe-3" },
    },
  ];
}
