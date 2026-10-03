"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingField } from "@/components/ui/floating-field";
import { FloatingSelect } from "@/components/ui/floating-select";
import type { UpsertCategoryRequest } from "@/types/api";
import type { CategoryRow } from "./data";

type CategoriesAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parents: CategoryRow[];
  onSubmit: (payload: UpsertCategoryRequest) => Promise<void> | void;
  submitting?: boolean;
};

function slugFromName(name: string) {
  return name.trim().replace(/\s+/g, "-");
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  parentId: "none",
};

const surface = "bg-popover";

export function CategoriesAddDialog({
  open,
  onOpenChange,
  parents,
  onSubmit,
  submitting = false,
}: CategoriesAddDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError(null);
  }, [open]);

  const parentOptions = useMemo(
    () => [
      { value: "none", label: "بدون دسته اصلی" },
      ...parents.map((category) => ({
        value: category.id,
        label: `${"—".repeat(category.depth)} ${category.name}`.trim(),
      })),
    ],
    [parents],
  );

  const hasParentOptions = parents.length > 0;

  const nextSortOrder = useMemo(() => {
    if (parents.length === 0) return 0;
    return Math.max(...parents.map((p) => p.sortOrder)) + 1;
  }, [parents]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("نام دسته الزامی است.");
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      slug: form.slug.trim() || slugFromName(form.name),
      description: form.description.trim() || null,
      parentId: form.parentId === "none" ? null : form.parentId,
      sortOrder: nextSortOrder,
      isActive: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <DialogTitle className="leading-none">افزودن دسته</DialogTitle>
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">بستن</span>
          </DialogClose>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <FloatingField
            label="نام"
            required
            surfaceClassName={surface}
            value={form.name}
            onChange={(value) => setForm((f) => ({ ...f, name: value }))}
          />
          <FloatingField
            label="اسلاگ"
            surfaceClassName={surface}
            dir="ltr"
            value={form.slug}
            onChange={(value) =>
              setForm((f) => ({
                ...f,
                slug: value.replace(/\s+/g, "-"),
              }))
            }
          />
          <FloatingSelect
            label="دسته اصلی"
            emptyValue="none"
            className="sm:col-span-2"
            surfaceClassName={surface}
            value={form.parentId}
            onChange={(value) => setForm((f) => ({ ...f, parentId: value }))}
            options={
              hasParentOptions
                ? parentOptions
                : [{ value: "none", label: "بدون دسته اصلی" }]
            }
            inactive={!hasParentOptions}
            searchPlaceholder="جستجو ..."
            onInactiveClick={() =>
              toast.error("در حال حاضر هیچ دسته بندی وجود ندارد", {
                id: "category-parent-empty",
              })
            }
          />
          <FloatingField
            label="توضیحات"
            className="sm:col-span-2"
            surfaceClassName={surface}
            value={form.description}
            onChange={(value) =>
              setForm((f) => ({ ...f, description: value }))
            }
          />

          {error ? (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          ) : null}

          <DialogFooter className="gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg px-5"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-lg px-5"
              disabled={submitting}
            >
              {submitting ? "در حال ایجاد..." : "ایجاد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
