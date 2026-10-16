import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ShopBrandingHead } from "@/components/layout/ShopBrandingHead";
import { ShopNotFound } from "@/components/layout/ShopNotFound";
import { AppProviders } from "@/providers/AppProviders";
import { isActiveTenant, serverFetch } from "@/lib/server-api";
import { shopPrimaryCssVars } from "@/lib/shop-primary-color";
import type { ShopSettings } from "@/types/api";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  if (!(await isActiveTenant())) {
    return {
      title: "فروشگاه یافت نشد",
      robots: { index: false, follow: false },
    };
  }

  const settings = await serverFetch<ShopSettings>("/api/shop-settings", {
    revalidate: false,
  });
  const title = settings?.browserTitle || "فروشگاه آپولو | ApolloShop";
  const description =
    settings?.metaDescription ||
    settings?.description ||
    "فروشگاه اینترنتی آپولو — خرید آنلاین با تجربه مدرن، سریع و حرفه‌ای.";
  const siteName = settings?.shopTitle || "فروشگاه آپولو";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    icons: settings?.favIconUrl
      ? {
          icon: [{ url: settings.favIconUrl }],
          shortcut: settings.favIconUrl,
          apple: settings.favIconUrl,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName,
      title,
      description,
      url: siteUrl,
      ...(settings?.logoUrl ? { images: [{ url: settings.logoUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  if (!(await isActiveTenant())) {
    // notFound() is forbidden in the root layout — render a dedicated page instead.
    return (
      <html lang="fa" dir="rtl" suppressHydrationWarning className="font-sans">
        <body className="flex min-h-screen flex-col font-sans antialiased" suppressHydrationWarning>
          <ShopNotFound />
        </body>
      </html>
    );
  }

  const settings = await serverFetch<ShopSettings>("/api/shop-settings", {
    revalidate: false,
  });

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className="font-sans"
      style={shopPrimaryCssVars(settings?.primaryColor)}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased" suppressHydrationWarning>
        <AppProviders shopCurrency={settings?.currency}>
          <ShopBrandingHead />
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
