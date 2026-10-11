"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, Database, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

type TestDataTopic = {
  key: string;
  title: string;
  description: string;
};

type TestDataStatus = {
  topics: TestDataTopic[];
  hasTestData: boolean;
  productCount: number;
  brandCount: number;
  categoryCount: number;
  blogPostCount: number;
};

type GenerateResult = {
  topicKey: string;
  topicTitle: string;
  brandsCreated: number;
  categoriesCreated: number;
  productsCreated: number;
  blogPostsCreated: number;
};

const STATUS_KEY = ["admin-test-data"] as const;

export function TestDataForm() {
  const queryClient = useQueryClient();
  const [topicKey, setTopicKey] = useState("");

  const status = useQuery({
    queryKey: STATUS_KEY,
    queryFn: async () => (await api.get<TestDataStatus>("/api/admin/test-data")).data,
  });

  const topics = status.data?.topics ?? [];
  const selected = useMemo(
    () => topics.find((t) => t.key === topicKey) ?? null,
    [topics, topicKey],
  );

  useEffect(() => {
    if (!topicKey && topics.length > 0) {
      setTopicKey(topics[0]!.key);
    }
  }, [topicKey, topics]);

  const invalidateCatalog = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: STATUS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["blog"] }),
    ]);
  };

  const generate = useMutation({
    mutationFn: async () =>
      (
        await api.post<GenerateResult>("/api/admin/test-data/generate", {
          topicKey,
        })
      ).data,
    onSuccess: async (data) => {
      await invalidateCatalog();
      toast.success(
        `داده تستی «${data.topicTitle}» ساخته شد: ${data.productsCreated} محصول، ${data.brandsCreated} برند، ${data.categoriesCreated} دسته، ${data.blogPostsCreated} بلاگ`,
      );
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const clear = useMutation({
    mutationFn: async () =>
      (await api.delete<{ productsRemoved: number }>("/api/admin/test-data")).data,
    onSuccess: async (data) => {
      await invalidateCatalog();
      toast.success(
        data.productsRemoved > 0
          ? "داده‌های تستی پاک شد"
          : "داده تستی‌ای برای پاک‌کردن نبود",
      );
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const busy = generate.isPending || clear.isPending;

  if (status.isLoading) {
    return <Skeleton className="h-48 w-full max-w-xl rounded-xl" />;
  }

  if (status.isError) {
    return (
      <p className="text-sm text-destructive">
        {getApiErrorMessage(status.error)}
      </p>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
        با انتخاب موضوع فروشگاه، ۲۰ محصول، ۵ برند، ۵ دسته‌بندی و ۵ مطلب وبلاگ
        نمونه (با تصویر واقعی) ساخته می‌شود. این داده‌ها فقط برای دمو هستند و با
        دکمه پاک‌سازی حذف می‌شوند.
      </div>

      {status.data?.hasTestData && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          داده تستی فعال: {status.data.productCount} محصول،{" "}
          {status.data.brandCount} برند، {status.data.categoryCount} دسته،{" "}
          {status.data.blogPostCount} بلاگ
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="test-topic" className="text-xs font-medium text-muted-foreground">
          موضوع فروشگاه
        </Label>
        <div className="relative w-full">
          <select
            id="test-topic"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full appearance-none justify-start font-normal",
              "dark:bg-background dark:hover:bg-background",
            )}
            value={topicKey}
            disabled={busy}
            onChange={(e) => setTopicKey(e.target.value)}
          >
            {topics.map((t) => (
              <option key={t.key} value={t.key}>
                {t.title}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute inset-e-3 top-2.5 size-4 opacity-50" />
        </div>
        {selected && (
          <p className="text-xs text-muted-foreground">{selected.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          disabled={!topicKey || busy}
          onClick={() => generate.mutate()}
          className="h-10 px-4"
        >
          {generate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Database className="size-4" />
          )}
          تولید داده تستی
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || !status.data?.hasTestData}
          onClick={() => {
            if (
              !window.confirm(
                "همه محصولات، دسته‌ها و بلاگ‌های تستی حذف شوند؟",
              )
            ) {
              return;
            }
            clear.mutate();
          }}
          className="h-10 px-4"
        >
          {clear.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          پاک کردن داده تستی
        </Button>
      </div>
    </div>
  );
}
