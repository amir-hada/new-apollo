const STORAGE_KEY = "apollo-recent-searches";
const MAX_ITEMS = 8;

export function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim())
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string) {
  if (typeof window === "undefined") return;
  const value = term.trim();
  if (value.length < 2) return;
  const next = [
    value,
    ...loadRecentSearches().filter((x) => x.toLowerCase() !== value.toLowerCase()),
  ].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
