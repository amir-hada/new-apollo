"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LegacyReactTable } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import type { CategoryRow } from "./data";

type CategoriesBulkActionsProps = {
  table: LegacyReactTable<CategoryRow>;
  onDeleteSelected: (ids: string[]) => Promise<void> | void;
};

export function CategoriesBulkActions({
  table,
  onDeleteSelected,
}: CategoriesBulkActionsProps) {
  const router = useRouter();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const singleSelected = selectedRows.length === 1;

  return (
    <BulkActionsToolbar table={table} entityName="دسته">
      {singleSelected ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => {
                  const id = selectedRows[0]?.original.id;
                  if (!id) return;
                  table.resetRowSelection();
                  router.push(`/admin/categories/${id}`);
                }}
                aria-label="ویرایش"
              />
            }
          >
            <Pencil />
          </TooltipTrigger>
          <TooltipContent>
            <p>ویرایش</p>
          </TooltipContent>
        </Tooltip>
      ) : null}

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={async () => {
                const ids = selectedRows.map((row) => row.original.id);
                await onDeleteSelected(ids);
                table.resetRowSelection();
              }}
              aria-label="حذف"
            />
          }
        >
          <Trash2 />
        </TooltipTrigger>
        <TooltipContent>
          <p>حذف</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  );
}
