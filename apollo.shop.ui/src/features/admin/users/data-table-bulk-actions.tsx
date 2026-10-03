"use client";

import type { LegacyReactTable } from "@tanstack/react-table/legacy";
import { Mail, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import type { User } from "./types";

type DataTableBulkActionsProps = {
  table: LegacyReactTable<User>;
  onDeactivateSelected?: (ids: string[]) => Promise<void> | void;
};

export function DataTableBulkActions({
  table,
  onDeactivateSelected,
}: DataTableBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkInvite = () => {
    toast.success(
      `دعوت برای ${selectedRows.length} کاربر ارسال خواهد شد (به‌زودی)`,
    );
    table.resetRowSelection();
  };

  const handleBulkDeactivate = async () => {
    const ids = selectedRows
      .filter((row) => row.original.isActive)
      .map((row) => row.original.id);

    if (!ids.length) {
      toast.message("کاربر فعالی برای غیرفعال‌سازی انتخاب نشده است");
      return;
    }

    try {
      await onDeactivateSelected?.(ids);
      table.resetRowSelection();
    } catch {
      // errors handled by caller
    }
  };

  const handleBulkDelete = () => {
    toast.message("حذف گروهی فعلاً در دسترس نیست");
  };

  return (
    <BulkActionsToolbar table={table} entityName="کاربر">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkInvite}
              className="size-8"
              aria-label="دعوت کاربران انتخاب‌شده"
            />
          }
        >
          <Mail />
          <span className="sr-only">دعوت کاربران انتخاب‌شده</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>دعوت کاربران انتخاب‌شده</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkDeactivate}
              className="size-8"
              aria-label="غیرفعال‌سازی کاربران انتخاب‌شده"
            />
          }
        >
          <UserX />
          <span className="sr-only">غیرفعال‌سازی کاربران انتخاب‌شده</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>غیرفعال‌سازی کاربران انتخاب‌شده</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="destructive"
              size="icon"
              onClick={handleBulkDelete}
              className="size-8"
              aria-label="حذف کاربران انتخاب‌شده"
            />
          }
        >
          <Trash2 />
          <span className="sr-only">حذف کاربران انتخاب‌شده</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>حذف کاربران انتخاب‌شده</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  );
}
