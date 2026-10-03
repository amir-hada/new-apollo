"use client";

import { useEffect, useState } from "react";
import {
  defaultSiteSettings,
  loadSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSettings(loadSiteSettings());
      setReady(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("apolloshop:site-settings", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("apolloshop:site-settings", sync);
    };
  }, []);

  return { settings, ready };
}
