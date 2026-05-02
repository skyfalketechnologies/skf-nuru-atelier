const SORT_OPTIONS = ["newest", "popular", "price_asc", "price_desc"] as const;
export type ShopSort = (typeof SORT_OPTIONS)[number];

const LIMIT_OPTIONS = [12, 24, 48] as const;
export type ShopLimit = (typeof LIMIT_OPTIONS)[number];

export type ShopFilterState = {
  search: string;
  category: string;
  brand: string;
  /** "" means all; API also accepts unisex */
  audience: string;
  sort: ShopSort;
  minPrice: string;
  maxPrice: string;
  limit: ShopLimit;
  page: number;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export function parseShopSearchParams(raw: Record<string, string | string[] | undefined>): ShopFilterState {
  const search = firstParam(raw.search)?.trim() ?? "";
  const category = firstParam(raw.category)?.trim() ?? "";
  const brand = firstParam(raw.brand)?.trim() ?? "";
  const audienceRaw = firstParam(raw.audience)?.trim() ?? "all";
  const audience = audienceRaw === "all" ? "all" : audienceRaw;
  const sortRaw = firstParam(raw.sort)?.trim() ?? "newest";
  const sort = SORT_OPTIONS.includes(sortRaw as ShopSort) ? (sortRaw as ShopSort) : "newest";
  const minPrice = firstParam(raw.minPrice)?.trim() ?? "";
  const maxPrice = firstParam(raw.maxPrice)?.trim() ?? "";
  const pageRaw = Number.parseInt(firstParam(raw.page) ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limitRaw = Number.parseInt(firstParam(raw.limit) ?? "12", 10);
  const limit = LIMIT_OPTIONS.includes(limitRaw as ShopLimit) ? (limitRaw as ShopLimit) : 12;

  return {
    search,
    category,
    brand,
    audience,
    sort,
    minPrice,
    maxPrice,
    limit,
    page,
  };
}

/** Query string for `/api/catalog/products`. */
export function toCatalogApiQuery(s: ShopFilterState): URLSearchParams {
  const q = new URLSearchParams();
  q.set("page", String(s.page));
  q.set("limit", String(s.limit));
  q.set("sort", s.sort);
  if (s.search) q.set("search", s.search);
  if (s.category) q.set("category", s.category);
  if (s.brand) q.set("brand", s.brand);
  if (s.audience && s.audience !== "all") q.set("audience", s.audience);
  const minN = Number.parseInt(s.minPrice, 10);
  if (s.minPrice !== "" && Number.isFinite(minN) && minN >= 0) q.set("minPrice", String(minN));
  const maxN = Number.parseInt(s.maxPrice, 10);
  if (s.maxPrice !== "" && Number.isFinite(maxN) && maxN >= 0) q.set("maxPrice", String(maxN));
  return q;
}

/** Relative URL for `/shop` with the given filter state (clean omits when possible). */
export function toShopUrl(s: ShopFilterState): string {
  const q = new URLSearchParams();
  if (s.search) q.set("search", s.search);
  if (s.category) q.set("category", s.category);
  if (s.brand) q.set("brand", s.brand);
  if (s.audience && s.audience !== "all") q.set("audience", s.audience);
  if (s.sort !== "newest") q.set("sort", s.sort);
  if (s.minPrice) q.set("minPrice", s.minPrice);
  if (s.maxPrice) q.set("maxPrice", s.maxPrice);
  if (s.limit !== 12) q.set("limit", String(s.limit));
  if (s.page > 1) q.set("page", String(s.page));
  const qs = q.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function withShopPage(s: ShopFilterState, page: number): ShopFilterState {
  return { ...s, page: Math.max(1, page) };
}

export function resetPage(s: ShopFilterState): ShopFilterState {
  return { ...s, page: 1 };
}
