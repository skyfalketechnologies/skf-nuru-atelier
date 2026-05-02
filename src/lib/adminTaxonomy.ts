import { apiGetAuth } from "@/lib/api";

export type AdminTaxonomyItem = {
  _id: string;
  name: string;
  slug: string;
};

let inflight: Promise<{ categories: AdminTaxonomyItem[]; brands: AdminTaxonomyItem[] }> | null = null;
let last: {
  token: string;
  categories: AdminTaxonomyItem[];
  brands: AdminTaxonomyItem[];
  at: number;
} | null = null;

const STALE_MS = 2500;

/** Clears the short-lived cache so the next fetch hits the network (e.g. after a category/brand mutation). */
export function invalidateAdminTaxonomyCache(): void {
  last = null;
}

/**
 * Loads categories + brands once for concurrent callers (e.g. product form + TaxonomyManager on the same screen).
 * Uses a brief stale-while-revalidate window to absorb React Strict Mode double-mount in development.
 */
export async function fetchAdminTaxonomy(token: string): Promise<{
  categories: AdminTaxonomyItem[];
  brands: AdminTaxonomyItem[];
}> {
  const now = Date.now();
  if (last && last.token === token && now - last.at < STALE_MS) {
    return { categories: last.categories, brands: last.brands };
  }
  if (!inflight) {
    inflight = (async () => {
      const [categoriesData, brandsData] = await Promise.all([
        apiGetAuth<{ categories: AdminTaxonomyItem[] }>("/api/admin/categories", token),
        apiGetAuth<{ brands: AdminTaxonomyItem[] }>("/api/admin/brands", token),
      ]);
      const data = {
        categories: categoriesData.categories,
        brands: brandsData.brands,
      };
      last = { token, ...data, at: Date.now() };
      return data;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
