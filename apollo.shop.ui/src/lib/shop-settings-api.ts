"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ShopSettings } from "@/types/api";

export const SHOP_SETTINGS_QUERY_KEY = ["shop-settings"] as const;

export function useShopSettings() {
  return useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
    staleTime: 60_000,
  });
}

export async function uploadShopAsset(
  file: File,
  folder: "logo" | "favicon" | "shop" | "avatar" | "hero" | "story",
) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string; fileName: string; contentType: string; size: number }>(
    `/api/admin/uploads?folder=${folder}`,
    form,
    {
      headers: { "Content-Type": undefined },
    },
  );
  return data;
}
