import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveProductImageUrl } from "@/lib/product-image";
import { serverFetch } from "@/lib/server-api";
import { formatDate } from "@/lib/utils";
import type { BlogPostDetail } from "@/types/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetch<BlogPostDetail>(`/api/blog/posts/${slug}`);
  if (!post) return { title: "مطلب یافت نشد" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || post.body.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: post.featuredImageUrl ? [{ url: post.featuredImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await serverFetch<BlogPostDetail>(`/api/blog/posts/${slug}`);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.featuredImageUrl || undefined,
    datePublished: post.publishedAtUtc || undefined,
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />
      {post.categoryName && <p className="text-sm text-primary">{post.categoryName}</p>}
      <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{formatDate(post.publishedAtUtc)}</p>
      {post.featuredImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveProductImageUrl(post.featuredImageUrl)}
          alt={post.title}
          className="mt-6 aspect-[16/9] w-full rounded-xl object-cover"
        />
      )}
      <div className="mt-8 whitespace-pre-wrap text-sm leading-8 text-foreground/90">{post.body}</div>
      {post.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
