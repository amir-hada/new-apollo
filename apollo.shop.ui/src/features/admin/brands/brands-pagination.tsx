"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LegacyReactTable } from "@tanstack/react-table/legacy";
import type { RowData } from "@tanstack/table-core";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/features/auth/normalize-phone";

type BrandsPaginationProps<TData extends RowData> = {
  table: LegacyReactTable<TData>;
};

export function BrandsPagination<TData extends RowData>({
  table,
}: BrandsPaginationProps<TData>) {
  const { pageIndex } = table.getState().pagination;
  const pageCount = Math.max(table.getPageCount(), 1);

  return (
    <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
      <span className="text-sm tabular-nums text-muted-foreground">
        {toPersianDigits(String(pageIndex + 1))} از{" "}
        {toPersianDigits(String(pageCount))}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        aria-label="صفحه قبل"
      >
        <ChevronRight className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="size-4" />
      </Button>
    </div>
  );
}
