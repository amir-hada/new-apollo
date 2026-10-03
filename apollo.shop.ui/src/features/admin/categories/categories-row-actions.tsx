"use client";

import {
  Ban,
  CircleCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
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
import type { CategoryRow } from "./data";

type CategoriesRowActionsProps = {
  row: LegacyRow<CategoryRow>;
  onDelete: (id: string) => void;
  onToggleActive: (category: CategoryRow) => void;
};

export function CategoriesRowActions({
  row,
  onDelete,
  onToggleActive,
}: CategoriesRowActionsProps) {
  const router = useRouter();
  const category = row.original;

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
          className="min-w-36 w-40 rounded-md p-0.5 shadow-sm"
        >
          <DropdownMenuItem
            className="gap-2 px-2 py-1.5 text-xs font-normal"
            onClick={() => router.push(`/admin/categories/${category.id}`)}
          >
            <Pencil className="size-3.5 opacity-70" />
            ویرایش
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 px-2 py-1.5 text-xs font-normal"
            onClick={() => onToggleActive(category)}
          >
            {category.isActive ? (
              <>
                <Ban className="size-3.5 opacity-70" />
                غیرفعال‌سازی
              </>
            ) : (
              <>
                <CircleCheck className="size-3.5 opacity-70" />
                فعال‌سازی
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-0.5" />
          <DropdownMenuItem
            variant="destructive"
            className="gap-2 px-2 py-1.5 text-xs font-normal"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="size-3.5 opacity-70" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
