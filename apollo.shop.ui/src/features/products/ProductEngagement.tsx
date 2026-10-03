"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Heart, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

type ProductEngagementProps = {
  productId: string;
  productSlug: string;
};

export function ProductEngagement({ productId, productSlug }: ProductEngagementProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    void api.post(`/api/products/${encodeURIComponent(productSlug)}/view`).catch(() => {
      /* ignore view tracking failures */
    });
  }, [productSlug]);

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
      setCommentCount((c) => c + 1);
      toast.success("نظر شما ثبت شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={liked ? "default" : "outline"}
          size="sm"
          disabled={likeMutation.isPending}
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
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3.5" />
          {toPersianDigits(String(commentCount))} نظر جدید در این نشست
        </span>
      </div>

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
    </div>
  );
}
