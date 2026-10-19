"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const items = [
  { id: "recents", label: "اخیر" },
  { id: "home", label: "خانه" },
  { id: "desktop", label: "دسکتاپ" },
  { id: "downloads", label: "دانلودها" },
  { id: "documents", label: "اسناد" },
] as const;

export function DisplayForm() {
  const [selected, setSelected] = useState<string[]>(["recents", "home"]);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id),
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("حداقل یک مورد را انتخاب کنید");
      return;
    }
    toast.success("تنظیمات نمایش ذخیره شد");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">سایدبار</Label>
        <p className="text-xs text-muted-foreground">
          مواردی که می‌خواهید در سایدبار نمایش داده شوند را انتخاب کنید.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-row items-center gap-2 rounded-lg border border-border px-2.5 py-2"
            >
              <Checkbox
                id={`display-${item.id}`}
                checked={selected.includes(item.id)}
                onCheckedChange={(v) => toggle(item.id, v === true)}
              />
              <Label
                htmlFor={`display-${item.id}`}
                className="mb-0 text-sm font-normal"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-0.5">
        <Button type="submit" className="h-10 px-5">
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
