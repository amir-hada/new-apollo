"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, getApiErrorMessage } from "@/lib/api";
import { blogStatusLabel } from "@/lib/labels";
import { formatDate, slugify } from "@/lib/utils";
import type { BlogPostListItem, PagedResult } from "@/types/api";

export default function AdminBlogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    body: "",
    excerpt: "",
    featuredImageUrl: "",
  });
  const queryClient = useQueryClient();

  const posts = useQuery({
    queryKey: ["admin-blog", page, q],
    queryFn: async () =>
      (
        await api.get<PagedResult<BlogPostListItem>>("/api/admin/blog/posts", {
          params: { page, pageSize: 10, search: q || undefined },
        })
      ).data,
  });

  const create = useMutation({
    mutationFn: async () =>
      (
        await api.post("/api/admin/blog/posts", {
          title: form.title,
          slug: form.slug || slugify(form.title),
          body: form.body,
          excerpt: form.excerpt || null,
          featuredImageUrl: form.featuredImageUrl || null,
          seoTitle: form.title,
          seoDescription: form.excerpt || null,
          categoryId: null,
          tags: [],
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("مطلب ایجاد شد");
      setForm({ title: "", slug: "", body: "", excerpt: "", featuredImageUrl: "" });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const publish = useMutation({
    mutationFn: async (id: string) => api.post(`/api/admin/blog/posts/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("منتشر شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/admin/blog/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <AdminPageHeader
        actions={
          <>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="w-52"
            />
            <Button
              onClick={() => {
                setPage(1);
                setQ(search.trim());
              }}
            >
              جستجو
            </Button>
          </>
        }
      />

      {posts.isLoading && <Skeleton className="h-64 w-full" />}
      {posts.isError && <ErrorState message={getApiErrorMessage(posts.error)} onRetry={() => posts.refetch()} />}
      {posts.data?.items.length === 0 && <EmptyState title="مطلبی نیست" />}
      {!!posts.data?.items.length && (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>انتشار</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.data.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === 1 ? "success" : "secondary"}>
                        {blogStatusLabel[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(p.publishedAtUtc)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {p.status !== 1 && (
                          <Button size="sm" variant="outline" onClick={() => publish.mutate(p.id)}>
                            انتشار
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}>
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={posts.data.page} totalPages={posts.data.totalPages} onChange={setPage} />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ایجاد مطلب</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div>
              <Label>عنوان</Label>
              <Input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))
                }
              />
            </div>
            <div>
              <Label>اسلاگ</Label>
              <Input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <Label>خلاصه</Label>
              <Input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div>
              <Label>تصویر شاخص (URL)</Label>
              <Input
                value={form.featuredImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, featuredImageUrl: e.target.value }))}
              />
            </div>
            <div>
              <Label>متن</Label>
              <Textarea required value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <Button disabled={create.isPending}>ایجاد</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
