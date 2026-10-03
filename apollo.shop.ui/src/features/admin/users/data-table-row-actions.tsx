"use client";

import { MoreHorizontal, Trash2, UserPen } from "lucide-react";
import type { LegacyRow } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "./types";
import { useUsers } from "./users-provider";

type DataTableRowActionsProps = {
  row: LegacyRow<User>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers();
  const user = row.original;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex size-8 p-0 data-[popup-open]:bg-muted"
          />
        }
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">باز کردن منو</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(user);
            setOpen("edit");
          }}
        >
          ویرایش
          <DropdownMenuShortcut>
            <UserPen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(user);
            setOpen("delete");
          }}
          variant="destructive"
        >
          {user.isActive ? "غیرفعال‌سازی" : "حذف"}
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
