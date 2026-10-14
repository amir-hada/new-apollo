"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import type { ProductCommentItem } from "@/types/api";

type ProductEngagementProps = {
  productId: string;
  productSlug: string;
  averageRating?: number | null;
  ratingCount?: number;
  commentCount?: number;
};

function Stars({ value, size = "size-3.5" }: { value: number; size?: string }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            size,
            n <= rounded ? "fill-amber-400 text-amber-400" : "fill-transparent text-[#c0c2c5]",
          )}
        />
      ))}
    </span>
  );
}

export function ProductEngagement({
  productId,
  productSlug,
  averageRating,
  ratingCount = 0,
  commentCount = 0,
}: ProductEngagementProps) {
  const queryClient = useQueryClient();
  const authenticated = useAuthStore((s) => Boolean(s.user));
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  const commentsKey = ["product-comments", productId] as const;

  useEffect(() => {
    void api.post(`/api/products/${encodeURIComponent(productSlug)}/view`).catch(() => {
      /* ignore view tracking failures */
    });
  }, [productSlug]);

  const comments = useQuery({
    queryKey: commentsKey,
    queryFn: async () =>
      (await api.get<ProductCommentItem[]>(`/api/products/${productId}/comments`)).data,
  });

  const likeMutation = useMutation({
    mutationFn: async () =>
      (await api.post<{ liked: boolean; likesCount: number }>(`/api/products/${productId}/like`))
        .data,
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikes(data.likesCount);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const commentMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post(`/api/products/${productId}/comments`, {
          body,
          rating,
        })
      ).data,
    onSuccess: () => {
      setBody("");
      setRating(null);
      void queryClient.invalidateQueries({ queryKey: commentsKey });
      toast.success("نظر شما ثبت شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const list = comments.data ?? [];
  const avg =
    averageRating != null && averageRating > 0
      ? averageRating
      : list.filter((c) => c.rating).length
        ? list.reduce((s, c) => s + (c.rating ?? 0), 0) /
          list.filter((c) => c.rating).length
        : null;
  const rated =
    ratingCount > 0 ? ratingCount : list.filter((c) => c.rating != null).length;
  const totalComments = commentCount > 0 ? commentCount : list.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e0e0e2] bg-[#fafafa] px-4 py-4 dark:border-white/10 dark:bg-muted/30">
        <div className="flex flex-col items-center gap-1 px-2">
          <span className="text-[28px] font-bold tabular-nums text-[#0c0c0c] dark:text-foreground">
            {avg != null
              ? toPersianDigits(avg.toFixed(1).replace(".", "٫"))
              : toPersianDigits("0")}
          </span>
          <Stars value={avg ?? 0} size="size-4" />
          <span className="text-[11px] text-[#81858b]">
            از {toPersianDigits(String(rated))} امتیاز
          </span>
        </div>
        <div className="h-16 w-px bg-[#e0e0e2] dark:bg-white/10" />
        <div className="min-w-0 flex-1 space-y-1 text-[13px] text-[#424750] dark:text-foreground">
          <p className="font-medium">
            {toPersianDigits(String(totalComments))} دیدگاه ثبت‌شده
          </p>
          <p className="text-[12px] text-[#81858b]">
            شما هم می‌توانید درباره این کالا نظر بدهید.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={liked ? "default" : "outline"}
            size="sm"
            disabled={likeMutation.isPending || !authenticated}
            onClick={() => likeMutation.mutate()}
            className="gap-1.5"
          >
            <Heart className={cn("size-4", liked && "fill-current")} />
            {liked ? "پسندیده‌اید" : "پسندیدن"}
            {likes > 0 ? (
              <span className="text-xs opacity-80">
                ({toPersianDigits(String(likes))})
              </span>
            ) : null}
          </Button>
          {!authenticated ? (
            <span className="text-xs text-muted-foreground">
              برای ثبت نظر وارد حساب شوید
            </span>
          ) : null}
        </div>

        {authenticated ? (
          <div className="space-y-2">
            <Label htmlFor="product-comment">نظر شما</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="rounded p-0.5 text-muted-foreground hover:text-amber-500"
                  aria-label={`${n} ستاره`}
                >
                  <Star
                    className={cn(
                      "size-4",
                      rating != null && n <= rating && "fill-amber-400 text-amber-500",
                    )}
                  />
                </button>
              ))}
            </div>
            <textarea
              id="product-comment"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="تجربه خرید یا نظر خود را بنویسید..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/35"
            />
            <Button
              type="button"
              size="sm"
              disabled={commentMutation.isPending || body.trim().length < 3}
              onClick={() => commentMutation.mutate()}
            >
              {commentMutation.isPending ? "در حال ارسال..." : "ثبت نظر"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#0c0c0c] dark:text-foreground">
          <MessageSquare className="size-4 text-[#81858b]" />
          دیدگاه کاربران
        </h3>
        {comments.isLoading ? (
          <p className="text-sm text-muted-foreground">در حال بارگذاری دیدگاه‌ها…</p>
        ) : list.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            هنوز دیدگاهی ثبت نشده است.
          </p>
        ) : (
          <ul className="divide-y divide-[#f0f0f1] rounded-xl border border-[#e0e0e2] dark:divide-white/10 dark:border-white/10">
            {list.map((c) => (
              <li key={c.id} className="space-y-2 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#f0f0f1] text-[12px] font-bold text-[#424750] dark:bg-muted">
                      {(c.authorName || "خ").charAt(0)}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-[#0c0c0c] dark:text-foreground">
                        {c.authorName || "خریدار"}
                      </p>
                      <p className="text-[11px] text-[#81858b]">
                        {toPersianDigits(
                          new Date(c.createdAtUtc).toLocaleDateString("fa-IR"),
                        )}
                      </p>
                    </div>
                  </div>
                  {c.rating != null ? <Stars value={c.rating} /> : null}
                </div>
                <p className="text-[13px] leading-7 text-[#424750] dark:text-foreground">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
