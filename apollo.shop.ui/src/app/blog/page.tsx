"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, getApiErrorMessage } from "@/lib/api";
import { resolveProductImageUrl } from "@/lib/product-image";
import { formatDate } from "@/lib/utils";
import { useSiteSettings } from "@/lib/use-site-settings";
import type { BlogPostListItem, PagedResult } from "@/types/api";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const { settings } = useSiteSettings();
  const blog = settings.blog;

  const posts = useQuery({
    queryKey: ["blog", page, q, blog.postsPerPage],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<BlogPostListItem>>("/api/blog/posts", {
        params: { page, pageSize: blog.postsPerPage || 9, search: q || undefined },
      });
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{blog.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{blog.description}</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در مطالب..."
            className="w-56"
          />
          <Button
            onClick={() => {
              setPage(1);
              setQ(search.trim());
            }}
          >
            جستجو
          </Button>
        </div>
      </div>

      {posts.isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      )}
      {posts.isError && <ErrorState message={getApiErrorMessage(posts.error)} onRetry={() => posts.refetch()} />}
      {posts.data?.items.length === 0 && <EmptyState title="مطلبی یافت نشد" />}
      {!!posts.data?.items.length && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {posts.data.items.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/40"
              >
                <div className="aspect-[16/9] bg-muted">
                  {post.featuredImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveProductImageUrl(post.featuredImageUrl)}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  {post.categoryName && <p className="text-xs text-muted-foreground">{post.categoryName}</p>}
                  <h2 className="font-semibold leading-6">{post.title}</h2>
                  {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                  <p className="text-xs text-muted-foreground">{formatDate(post.publishedAtUtc)}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={posts.data.page} totalPages={posts.data.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
