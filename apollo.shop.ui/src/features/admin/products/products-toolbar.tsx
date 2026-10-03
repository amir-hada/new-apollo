"use client";

import { Plus, Search, Settings2, X } from "lucide-react";
import type { LegacyReactTable } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productStatusOptions, type ProductRow } from "./data";

const columnLabels: Record<string, string> = {
  name: "نام",
  basePrice: "قیمت",
  status: "وضعیت",
  totalSales: "فروش کل",
  totalRevenue: "درآمد کل",
};

type ProductsToolbarProps = {
  table: LegacyReactTable<ProductRow>;
  categories: string[];
  onAdd: () => void;
};

export function ProductsToolbar({
  table,
  categories,
  onAdd,
}: ProductsToolbarProps) {
  const nameFilter =
    (table.getColumn("name")?.getFilterValue() as string) ?? "";
  const categoryFilter =
    (table.getColumn("category")?.getFilterValue() as string[]) ?? [];
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string[]) ?? [];

  const isFiltered =
    !!nameFilter || categoryFilter.length > 0 || statusFilter.length > 0;

  const categoryValue = categoryFilter[0] ?? "any";
  const statusValue = statusFilter[0] ?? "any";
  const categoryLabel =
    categoryValue === "any"
      ? "همه"
      : categories.find((c) => c === categoryValue) || categoryValue;
  const statusLabel =
    statusValue === "any"
      ? "همه"
      : productStatusOptions.find((o) => o.value === statusValue)?.label ||
        statusValue;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={nameFilter}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          placeholder="جستجو ..."
          className="h-9 ps-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          size="icon"
          className="size-9"
          onClick={onAdd}
          aria-label="افزودن محصول"
        >
          <Plus className="size-4" />
        </Button>

        <Select
          value={categoryValue}
          onValueChange={(value) => {
            if (!value || value === "any") {
              table.getColumn("category")?.setFilterValue(undefined);
              return;
            }
            table.getColumn("category")?.setFilterValue([value]);
          }}
        >
          <SelectTrigger className="h-9 w-auto min-w-36 gap-1.5">
            <SelectValue>
              <span className="text-sm">
                دسته:{" "}
                <span className="font-medium text-foreground">
                  {categoryLabel}
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="any">همه</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusValue}
          onValueChange={(value) => {
            if (!value || value === "any") {
              table.getColumn("status")?.setFilterValue(undefined);
              return;
            }
            table.getColumn("status")?.setFilterValue([value]);
          }}
        >
          <SelectTrigger className="h-9 w-auto min-w-36 gap-1.5">
            <SelectValue>
              <span className="text-sm">
                وضعیت:{" "}
                <span className="font-medium text-foreground">
                  {statusLabel}
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="any">همه</SelectItem>
            {productStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                aria-label="نمایش ستون‌ها"
              />
            }
          >
            <Settings2 className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>ستون‌های قابل نمایش</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.id in columnLabels && column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id]}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-2"
            onClick={() => {
              table.getColumn("name")?.setFilterValue("");
              table.getColumn("category")?.setFilterValue(undefined);
              table.getColumn("status")?.setFilterValue(undefined);
            }}
          >
            بازنشانی
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
