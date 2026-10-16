import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getShopIndustryGuide,
  getShopIndustryPreset,
} from "@/lib/shop-industry-presets";
import { serverFetch } from "@/lib/server-api";
import type { ShopSettings } from "@/types/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const settings = await serverFetch<ShopSettings>("/api/shop-settings");
  const guide = getShopIndustryGuide(settings?.industryKey, slug);
  if (!guide) return { title: "راهنما یافت نشد" };
  return {
    title: guide.title,
    description: guide.description,
  };
}

export default async function IndustryGuidePage({ params }: Props) {
  const { slug } = await params;
  const settings = await serverFetch<ShopSettings>("/api/shop-settings");
  const industry = getShopIndustryPreset(settings?.industryKey);
  const guide = getShopIndustryGuide(settings?.industryKey, slug);
  if (!guide) notFound();

  const otherGuides = industry.guides.filter((g) => g.slug !== guide.slug);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          فروشگاه
        </Link>
        <ChevronLeft className="size-3 opacity-40" />
        <span className="text-foreground">{guide.title}</span>
      </nav>

      <p className="text-[12px] font-medium text-primary">{industry.title}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {guide.title}
      </h1>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {guide.description}
      </p>

      <div className="mt-8 space-y-8">
        {guide.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-lg font-bold">{section.heading}</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {section.body}
            </p>
            {section.table ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[280px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {section.table.headers.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-start font-semibold"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr
                        key={`${section.heading}-${i}`}
                        className="border-b border-border last:border-0"
                      >
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2.5 tabular-nums">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {otherGuides.length > 0 ? (
        <div className="mt-10 border-t border-border pt-6">
          <p className="mb-3 text-sm font-bold">سایر راهنماهای این فروشگاه</p>
          <ul className="flex flex-wrap gap-2">
            {otherGuides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="inline-flex rounded-lg border border-border px-3 py-1.5 text-[13px] hover:border-primary hover:text-primary"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8">
        <Link
          href="/products"
          className="text-sm font-medium text-primary hover:underline"
        >
          مشاهده محصولات
        </Link>
      </div>
    </div>
  );
}
