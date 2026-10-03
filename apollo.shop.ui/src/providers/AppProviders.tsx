"use client";

import { Suspense, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DocumentTitle } from "@/components/layout/DocumentTitle";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { TooltipProvider } from "@/components/ui/tooltip";
import { makeQueryClient } from "@/lib/query-client";
import { ShopCurrencyProvider } from "@/providers/ShopCurrencyProvider";

export function AppProviders({
  children,
  shopCurrency,
}: {
  children: React.ReactNode;
  shopCurrency?: string | null;
}) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ShopCurrencyProvider initialCurrency={shopCurrency}>
          <TooltipProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
              <DocumentTitle />
            </Suspense>
            {children}
          </TooltipProvider>
        </ShopCurrencyProvider>
        <Toaster
          richColors
          position="top-center"
          dir="rtl"
          closeButton
          toastOptions={{
            classNames: {
              toast: "font-sans",
              title: "font-sans text-sm font-normal",
              description: "font-sans text-sm",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
