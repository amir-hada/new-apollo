"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyShopPrimaryColor } from "@/lib/shop-primary-color";
import { useShopSettings } from "@/lib/shop-settings-api";

/** Applies favicon and primary brand color from shop settings. */
export function ShopBrandingHead() {
  const { data } = useShopSettings();

  useEffect(() => {
    if (!data) return;

    applyShopPrimaryColor(data.primaryColor);

    const href = data.favIconUrl;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!href) {
      if (link && link.dataset.shopManaged === "1") {
        link.remove();
      }
      return;
    }

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.dataset.shopManaged = "1";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [data]);

  return null;
}
