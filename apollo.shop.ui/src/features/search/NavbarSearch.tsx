"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Brand, CategoryTree, SearchSuggestResult } from "@/types/api";
import {
  clearRecentSearches,
  loadRecentSearches,
  saveRecentSearch,
} from "@/features/search/recent-searches";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function flatCategories(nodes: CategoryTree[] = [], acc: CategoryTree[] = []) {
  for (const n of nodes) {
    acc.push(n);
    if (n.children?.length) flatCategories(n.children, acc);
  }
  return acc;
}

type NavbarSearchProps = {
  className?: string;
  style?: CSSProperties;
  inputClassName?: string;
  onNavigate?: () => void;
};

type FlatItem = { href: string; key: string; label: string };

export function NavbarSearch({
  className,
  style,
  inputClassName,
  onNavigate,
}: NavbarSearchProps) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const debounced = useDebouncedValue(query.trim(), 220);

  useEffect(() => {
    setRecent(loadRecentSearches());
  }, []);

  const suggest = useQuery({
    queryKey: ["search-suggest", debounced],
    enabled: debounced.length >= 2,
    staleTime: 20_000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<SearchSuggestResult>("/api/search/suggest", {
        params: { q: debounced, limit: 8 },
        signal,
      });
      return data;
    },
  });

  const popularSource = useQuery({
    queryKey: ["search-popular-chips"],
    staleTime: 5 * 60_000,
    enabled: open && query.trim().length < 2,
    queryFn: async () => {
      const [cats, brands] = await Promise.all([
        api.get<CategoryTree[]>("/api/categories/tree"),
        api.get<Brand[]>("/api/brands"),
      ]);
      return {
        categories: flatCategories(cats.data ?? []).slice(0, 10),
        brands: (brands.data ?? []).slice(0, 6),
      };
    },
  });

  const textSuggestions = useMemo(() => {
    const data = suggest.data;
    if (!data) return [] as string[];
    const q = debounced.toLowerCase();
    const seen = new Set<string>();
    const out: string[] = [];
    const push = (label: string) => {
      const t = label.trim();
      if (!t) return;
      const key = t.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(t);
    };

    // Prefer names that start with / contain the query (Digikala-like autocomplete lines)
    for (const p of data.products) push(p.name);
    for (const b of data.brands) push(b.name);
    for (const c of data.categories) push(c.name);

    return out
      .sort((a, b) => {
        const as = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs || a.length - b.length;
      })
      .slice(0, 8);
  }, [suggest.data, debounced]);

  const flatItems = useMemo(() => {
    if (debounced.length < 2) return [] as FlatItem[];
    const items: FlatItem[] = [
      ...textSuggestions.map((label) => ({
        href: `/products?search=${encodeURIComponent(label)}`,
        key: `t-${label}`,
        label,
      })),
      ...(suggest.data?.categories ?? []).map((c) => ({
        href: `/categories/${c.slug}`,
        key: `c-${c.id}`,
        label: c.name,
      })),
    ];
    // dedupe by href
    const seen = new Set<string>();
    return items.filter((i) => {
      if (seen.has(i.href)) return false;
      seen.add(i.href);
      return true;
    });
  }, [debounced.length, textSuggestions, suggest.data?.categories]);

  const hasTypedResults =
    textSuggestions.length > 0 || (suggest.data?.categories.length ?? 0) > 0;
  const showIdlePanel = open && query.trim().length < 2;
  const showSuggestPanel = open && query.trim().length >= 2;
  const showPanel = showIdlePanel || showSuggestPanel;

  useEffect(() => {
    setActiveIndex(-1);
  }, [debounced, suggest.dataUpdatedAt]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function rememberAndGo(term: string, href?: string) {
    saveRecentSearch(term);
    setRecent(loadRecentSearches());
    setOpen(false);
    onNavigate?.();
    router.push(href ?? `/products?search=${encodeURIComponent(term)}`);
  }

  function submitSearch(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (activeIndex >= 0 && flatItems[activeIndex]) {
      rememberAndGo(flatItems[activeIndex].label, flatItems[activeIndex].href);
      return;
    }
    if (!q) {
      setOpen(true);
      return;
    }
    rememberAndGo(q);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestPanel) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const popularCats = popularSource.data?.categories ?? [];
  const popularBrands = popularSource.data?.brands ?? [];

  let optionOffset = 0;

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)} style={style}>
      <form onSubmit={submitSearch} className="relative" role="search">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-[#81858b]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="جستجو در همه کالاها"
          className={cn(
            "h-12 w-full rounded-md border-0 bg-[#f0f0f1] pe-10 ps-11 text-[13px] text-foreground outline-none transition placeholder:text-[#a1a3a8] focus:bg-[#e8e8ea] focus:ring-2 focus:ring-primary/20 dark:bg-muted dark:focus:bg-muted",
            inputClassName,
          )}
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {query ? (
          <button
            type="button"
            aria-label="پاک کردن"
            className="absolute end-2.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#81858b] hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            onClick={() => {
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-[60] max-h-[min(72vh,32rem)] overflow-y-auto rounded-md border border-[#e0e0e2] bg-background shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:border-white/10"
        >
          {/* حالت خالی / فوکوس — شبیه دیجی‌کالا */}
          {showIdlePanel ? (
            <div className="space-y-5 p-4">
              {recent.length > 0 ? (
                <section>
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-bold text-[#3f4064] dark:text-foreground">
                      جستجوهای اخیر
                    </h3>
                    <button
                      type="button"
                      className="text-[12px] text-[#81858b] transition hover:text-primary"
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                    >
                      پاک کردن
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          rememberAndGo(term);
                        }}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#e0e0e2] bg-background px-2.5 py-1.5 text-[12px] text-[#3f4064] transition hover:border-primary/40 hover:bg-muted/50 dark:border-white/10 dark:text-foreground"
                      >
                        <LayoutGrid className="size-3.5 shrink-0 text-[#a1a3a8]" />
                        <span className="truncate">{term}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <h3 className="mb-2.5 text-[13px] font-bold text-[#3f4064] dark:text-foreground">
                  جستجوهای پرطرفدار
                </h3>
                {popularSource.isLoading ? (
                  <div className="flex items-center gap-2 py-2 text-[12px] text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    در حال بارگذاری...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {popularCats.map((c) => (
                      <button
                        key={`cat-${c.id}`}
                        type="button"
                        onClick={() => {
                          setQuery(c.name);
                          rememberAndGo(c.name, `/categories/${c.slug}`);
                        }}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#e0e0e2] bg-background px-2.5 py-1.5 text-[12px] text-[#3f4064] transition hover:border-primary/40 hover:bg-muted/50 dark:border-white/10 dark:text-foreground"
                      >
                        <span className="truncate">{c.name}</span>
                        <TrendingUp className="size-3.5 shrink-0 text-[#a1a3a8]" />
                      </button>
                    ))}
                    {popularBrands.map((b) => (
                      <button
                        key={`brand-${b.id}`}
                        type="button"
                        onClick={() => {
                          setQuery(b.name);
                          rememberAndGo(
                            b.name,
                            `/products?brand=${encodeURIComponent(b.slug)}`,
                          );
                        }}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#e0e0e2] bg-background px-2.5 py-1.5 text-[12px] text-[#3f4064] transition hover:border-primary/40 hover:bg-muted/50 dark:border-white/10 dark:text-foreground"
                      >
                        {b.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.imagePath}
                            alt=""
                            className="size-4 shrink-0 rounded object-contain"
                          />
                        ) : null}
                        <span className="truncate">{b.name}</span>
                        <TrendingUp className="size-3.5 shrink-0 text-[#a1a3a8]" />
                      </button>
                    ))}
                    {!popularSource.isLoading &&
                    popularCats.length === 0 &&
                    popularBrands.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground">
                        هنوز مورد پرطرفداری ثبت نشده است.
                      </p>
                    ) : null}
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {/* حالت تایپ — لیست پیشنهاد مثل دیجی‌کالا */}
          {showSuggestPanel ? (
            <div>
              {suggest.isFetching && debounced === query.trim() ? (
                <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  در حال جستجو...
                </div>
              ) : null}

              {!suggest.isFetching && !hasTypedResults ? (
                <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                  نتیجه‌ای برای «{debounced}» پیدا نشد
                </div>
              ) : null}

              {hasTypedResults ? (
                <ul className="py-1">
                  {textSuggestions.map((label) => {
                    const idx = optionOffset++;
                    const active = idx === activeIndex;
                    return (
                      <li key={`suggest-${label}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={cn(
                            "flex w-full items-center gap-3 border-b border-[#f0f0f1] px-4 py-3 text-start text-[13px] transition last:border-b-0 dark:border-white/5",
                            active
                              ? "bg-muted/80 text-primary"
                              : "text-[#3f4064] hover:bg-muted/50 dark:text-foreground",
                          )}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => rememberAndGo(label)}
                        >
                          <Search className="size-4 shrink-0 text-[#a1a3a8]" />
                          <span className="truncate font-medium">{label}</span>
                        </button>
                      </li>
                    );
                  })}

                  {(suggest.data?.categories ?? []).map((c) => {
                    const idx = optionOffset++;
                    const active = idx === activeIndex;
                    return (
                      <li key={`cat-row-${c.id}`}>
                        <Link
                          href={`/categories/${c.slug}`}
                          role="option"
                          aria-selected={active}
                          className={cn(
                            "flex w-full items-center gap-3 border-b border-[#f0f0f1] px-4 py-3 text-[13px] transition last:border-b-0 dark:border-white/5",
                            active
                              ? "bg-muted/80"
                              : "hover:bg-muted/50",
                          )}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            saveRecentSearch(c.name);
                            setRecent(loadRecentSearches());
                            setOpen(false);
                            onNavigate?.();
                          }}
                        >
                          <LayoutGrid className="size-4 shrink-0 text-[#a1a3a8]" />
                          <span className="min-w-0 flex-1 truncate font-medium text-[#3f4064] dark:text-foreground">
                            {c.name}
                          </span>
                          {c.parentName ? (
                            <span className="shrink-0 text-[12px] text-primary">
                              در {c.parentName}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[12px] text-primary">
                              در دسته‌ها
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {query.trim() ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1.5 border-t border-[#e0e0e2] px-3 py-3 text-[12px] font-medium text-primary hover:bg-muted/40 dark:border-white/10"
                  onClick={() => submitSearch()}
                >
                  <Search className="size-3.5" />
                  جستجو برای «{query.trim()}»
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
