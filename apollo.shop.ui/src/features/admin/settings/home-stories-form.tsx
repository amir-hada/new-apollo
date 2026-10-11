"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  SHOP_SETTINGS_QUERY_KEY,
  uploadShopAsset,
} from "@/lib/shop-settings-api";
import type { HomeStory, ShopSettings } from "@/types/api";

type StoryDraft = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `story-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function HomeStoriesForm() {
  const queryClient = useQueryClient();
  const [stories, setStories] = useState<StoryDraft[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  const settings = useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
  });

  useEffect(() => {
    if (!settings.data) return;
    setStories(
      (settings.data.homeStories ?? []).map((s: HomeStory) => ({
        id: s.id || newId(),
        title: s.title ?? "",
        imageUrl: s.imageUrl,
        linkUrl: s.linkUrl ?? "",
      })),
    );
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        stories: stories
          .filter((s) => s.imageUrl.trim())
          .map((s, index) => ({
            id: s.id,
            title: s.title.trim() || "استوری",
            imageUrl: s.imageUrl.trim(),
            linkUrl: s.linkUrl.trim() || null,
            sortOrder: index,
          })),
      };
      const { data } = await api.put<ShopSettings>(
        "/api/admin/shop-settings/home-stories",
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_SETTINGS_QUERY_KEY, data);
      void queryClient.invalidateQueries({ queryKey: SHOP_SETTINGS_QUERY_KEY });
      toast.success("استوری‌ها ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function onUpload(file: File | undefined, storyId: string) {
    if (!file) return;
    setUploadingId(storyId);
    try {
      const result = await uploadShopAsset(file, "story");
      setStories((prev) =>
        prev.map((s) => (s.id === storyId ? { ...s, imageUrl: result.url } : s)),
      );
      toast.success("تصویر استوری آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (settings.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (settings.isError) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {getApiErrorMessage(settings.error)}
        <Button className="mt-3" variant="outline" onClick={() => settings.refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <p className="text-xs text-muted-foreground">
        استوری‌های دایره‌ای بین بنر و پیشنهاد شگفت‌انگیز. اگر خالی باشد در سایت نمایش داده
        نمی‌شود. تصویر مربعی (مثلاً ۵۰۰×۵۰۰) بهتر است.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const id = uploadTargetId.current;
          if (!id) return;
          void onUpload(e.target.files?.[0], id);
        }}
      />

      <div className="space-y-3">
        {stories.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            هنوز استوری اضافه نشده است.
          </div>
        ) : (
          stories.map((story, index) => (
            <div
              key={story.id}
              className="rounded-md border border-border bg-card p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">استوری {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() =>
                    setStories((prev) => prev.filter((s) => s.id !== story.id))
                  }
                >
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
                <button
                  type="button"
                  disabled={uploadingId === story.id}
                  onClick={() => {
                    uploadTargetId.current = story.id;
                    fileInputRef.current?.click();
                  }}
                  className="relative mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted/40"
                >
                  {story.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-5 text-muted-foreground" />
                  )}
                  {uploadingId === story.id ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2 className="size-5 animate-spin" />
                    </span>
                  ) : null}
                </button>

                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`story-title-${story.id}`} className="text-xs">
                      عنوان
                    </Label>
                    <Input
                      id={`story-title-${story.id}`}
                      className="h-9 text-sm"
                      value={story.title}
                      onChange={(e) =>
                        setStories((prev) =>
                          prev.map((s) =>
                            s.id === story.id ? { ...s, title: e.target.value } : s,
                          ),
                        )
                      }
                      placeholder="مثلاً شگفت‌انگیز"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`story-link-${story.id}`} className="text-xs">
                      لینک (اختیاری)
                    </Label>
                    <Input
                      id={`story-link-${story.id}`}
                      className="h-9 text-sm"
                      dir="ltr"
                      placeholder="/products یا https://..."
                      value={story.linkUrl}
                      onChange={(e) =>
                        setStories((prev) =>
                          prev.map((s) =>
                            s.id === story.id ? { ...s, linkUrl: e.target.value } : s,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setStories((prev) => [
              ...prev,
              { id: newId(), title: "", imageUrl: "", linkUrl: "" },
            ])
          }
        >
          <Plus className="size-4" />
          افزودن استوری
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ذخیره استوری‌ها"
          )}
        </Button>
      </div>
    </form>
  );
}
