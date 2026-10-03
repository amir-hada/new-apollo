"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LegacyRow } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductRow } from "./data";

type ProductsRowActionsProps = {
  row: LegacyRow<ProductRow>;
  onDelete: (id: string) => void;
};

export function ProductsRowActions({ row, onDelete }: ProductsRowActionsProps) {
  const router = useRouter();
  const product = row.original;

  return (
    <div className="flex items-center justify-start pe-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 data-[popup-open]:bg-muted"
            />
          }
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">عملیات</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-32 w-36 rounded-md p-0.5 shadow-sm"
        >
          <DropdownMenuItem
            className="gap-2 px-2 py-1.5 text-xs font-normal"
            onClick={() => router.push(`/admin/products/${product.id}`)}
          >
            <Pencil className="size-3.5 opacity-70" />
            ویرایش
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-0.5" />
          <DropdownMenuItem
            variant="destructive"
            className="gap-2 px-2 py-1.5 text-xs font-normal"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="size-3.5 opacity-70" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
