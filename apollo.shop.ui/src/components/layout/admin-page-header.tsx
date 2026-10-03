"use client";

import { cn } from "@/lib/utils";

/** Toolbar actions row for admin pages (page title lives in the shell header). */
export function AdminPageHeader({
  actions,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  if (!actions) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2",
        className,
      )}
    >
      {actions}
    </div>
  );
}
