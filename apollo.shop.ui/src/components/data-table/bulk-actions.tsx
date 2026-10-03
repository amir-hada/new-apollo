"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RowData } from "@tanstack/table-core";
import type { LegacyReactTable } from "@tanstack/react-table/legacy";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DataTableBulkActionsProps<TData extends RowData> = {
  table: LegacyReactTable<TData>;
  entityName: string;
  children: React.ReactNode;
};

export function DataTableBulkActions<TData extends RowData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedCount > 0) {
      const message = `${selectedCount} ${entityName} انتخاب شد. نوار اقدامات گروهی در دسترس است.`;
      queueMicrotask(() => setAnnouncement(message));
      const timer = setTimeout(() => setAnnouncement(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedCount, entityName]);

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const buttons = toolbarRef.current?.querySelectorAll("button");
    if (!buttons) return;

    const currentIndex = Array.from(buttons).findIndex(
      (button) => button === document.activeElement,
    );

    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        const prevIndex =
          currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
        break;
      }
      case "Home":
        event.preventDefault();
        buttons[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;
      case "Escape": {
        const target = event.target as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;
        const isFromDropdown =
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          activeElement?.closest('[data-slot="dropdown-menu-trigger"]') ||
          activeElement?.closest('[data-slot="dropdown-menu-content"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]');
        if (isFromDropdown) return;
        event.preventDefault();
        handleClearSelection();
        break;
      }
    }
  };

  if (selectedCount === 0 || !mounted) {
    return null;
  }

  return createPortal(
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label={`اقدامات گروهی برای ${selectedCount} ${entityName} انتخاب‌شده`}
        aria-describedby="bulk-actions-description"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-x-2 rounded-xl border p-2 shadow-xl",
            "bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/60",
            "transition-all delay-100 duration-300 ease-out hover:scale-105",
            "focus-within:ring-2 focus-within:ring-ring/50 focus-within:outline-none",
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearSelection}
                  className="size-6 rounded-full"
                  aria-label="پاک کردن انتخاب"
                />
              }
            >
              <X />
              <span className="sr-only">پاک کردن انتخاب</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>پاک کردن انتخاب (Escape)</p>
            </TooltipContent>
          </Tooltip>

          <span
            className="inline-block h-8 w-px shrink-0 bg-border"
            aria-hidden="true"
          />

          <div
            className="flex items-center gap-x-1 text-sm font-light text-muted-foreground"
            id="bulk-actions-description"
          >
            <Badge
              variant="default"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full p-0 text-[11px] font-normal leading-none tabular-nums"
              aria-label={`${selectedCount} انتخاب‌شده`}
            >
              {toPersianDigits(String(selectedCount))}
            </Badge>{" "}
            <span className="hidden font-light sm:inline">{entityName}</span>{" "}
            <span className="font-light">انتخاب‌شده</span>
          </div>

          <span
            className="inline-block h-8 w-px shrink-0 bg-border"
            aria-hidden="true"
          />

          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
