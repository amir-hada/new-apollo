import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetailView } from "@/features/products/ProductDetailView";
import { resolveProductImageUrl } from "@/lib/product-image";
import { getProductDisplayPrices } from "@/lib/product-price";
import { serverFetch } from "@/lib/server-api";
import type { ProductDetail, ShopSettings } from "@/types/api";

type Props = { params: Promise<{ slug: string }> };

function isImageMedia(i: {
  mediaKind?: number | null;
  imagePath: string;
  isPrimary: boolean;
}) {
  if (i.mediaKind === 1) return false;
  return !/\.(mp4|webm|mov)(\?|$)/i.test(i.imagePath);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pickPrimaryImage(product: ProductDetail) {
  return (
    product.images.find((i) => i.isPrimary && isImageMedia(i))?.imagePath ||
    product.images.find((i) => isImageMedia(i))?.imagePath
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverFetch<ProductDetail>(`/api/products/${slug}`);
  if (!product) return { title: "محصول یافت نشد" };

  const plain = stripHtml(product.description || "");
  const title = product.seoTitle?.trim() || product.name;
  const description =
    product.seoDescription?.trim() || plain.slice(0, 160) || undefined;
  const keywords = product.seoKeywords
    ?.split(/[,،]/)
    .map((k) => k.trim())
    .filter(Boolean);
  const image = resolveProductImageUrl(
    product.ogImageUrl?.trim() || pickPrimaryImage(product),
  );
  const ogTitle = product.ogTitle?.trim() || title;
  const ogDescription = product.ogDescription?.trim() || description;
  const canonical = product.canonicalUrl?.trim() || `/products/${slug}`;
  const robots = {
    index: !product.robotsNoIndex,
    follow: !product.robotsNoFollow,
  };

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      url: canonical,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
    alternates: { canonical },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    serverFetch<ProductDetail>(`/api/products/${slug}`),
    serverFetch<ShopSettings>("/api/shop-settings"),
  ]);
  if (!product) notFound();

  const image = resolveProductImageUrl(pickPrimaryImage(product));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { current } = getProductDisplayPrices(product);
  const galleryImages = product.images
    .filter((i) => isImageMedia(i))
    .map((i) => i.imagePath);
  if (galleryImages.length === 0) galleryImages.push(image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.seoDescription || stripHtml(product.description || ""),
    image: galleryImages,
    brand: product.brandName
      ? { "@type": "Brand", name: product.brandName }
      : undefined,
    sku: product.sku || product.variants[0]?.sku,
    keywords: product.seoKeywords || product.focusKeyword || undefined,
    url: product.canonicalUrl?.trim() || `${siteUrl}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      url:
        product.canonicalUrl?.trim() || `${siteUrl}/products/${product.slug}`,
      priceCurrency: "IRR",
      price: Math.round(current * 10),
      availability:
        product.isAvailable &&
        (product.stockQuantity > 0 ||
          product.variants.some((v) => v.stockQuantity > 0))
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductDetailView product={product} currency={settings?.currency} />
    </>
  );
}
