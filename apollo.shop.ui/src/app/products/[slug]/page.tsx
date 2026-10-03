import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { serverFetch } from "@/lib/server-api";
import { formatPrice } from "@/lib/shop-currency";
import { getProductDisplayPrices } from "@/lib/product-price";
import type { ProductDetail, ShopSettings } from "@/types/api";
import { AddToCartForm } from "@/features/cart/AddToCartForm";
import { ProductEngagement } from "@/features/products/ProductEngagement";

type Props = { params: Promise<{ slug: string }> };

function isImageMedia(i: { mediaKind?: number | null; imagePath: string; isPrimary: boolean }) {
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
  const image =
    product.ogImageUrl?.trim() || pickPrimaryImage(product) || undefined;
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
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: image ? [image] : undefined,
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

  const image = pickPrimaryImage(product);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { current, original, discountPercentLabel } = getProductDisplayPrices(product);
  const currency = settings?.currency;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.seoDescription || stripHtml(product.description || ""),
    image: product.images.filter((i) => isImageMedia(i)).map((i) => i.imagePath),
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    sku: product.sku || product.variants[0]?.sku,
    keywords: product.seoKeywords || product.focusKeyword || undefined,
    url: product.canonicalUrl?.trim() || `${siteUrl}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      url: product.canonicalUrl?.trim() || `${siteUrl}/products/${product.slug}`,
      priceCurrency: "IRR",
      // Schema.org IRR = ریال؛ قیمت ذخیره‌شده تومان است.
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd data={jsonLd} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-muted-foreground">بدون تصویر</div>
          )}
        </div>
        <div className="space-y-5">
          {product.brandName && <p className="text-sm text-muted-foreground">{product.brandName}</p>}
          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(current, currency)}
            </span>
            {original != null ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(original, currency)}
              </span>
            ) : null}
            {discountPercentLabel ? (
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {discountPercentLabel}
              </span>
            ) : null}
          </div>
          <AddToCartForm product={product} />
          <ProductEngagement productId={product.id} productSlug={product.slug} />
          <div
            className="prose prose-sm dark:prose-invert max-w-none leading-7"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />
          {product.specs.length > 0 && (
            <div className="rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((s) => (
                    <tr
                      key={`${s.id ?? s.name}`}
                      className="border-b border-border last:border-0"
                    >
                      <th className="w-1/3 bg-muted/50 px-4 py-3 text-start font-medium">
                        {s.name}
                      </th>
                      <td className="px-4 py-3">
                        {(s.values ?? []).map((v) => v.value).filter(Boolean).join("، ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
