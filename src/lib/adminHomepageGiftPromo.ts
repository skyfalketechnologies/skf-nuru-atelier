import { apiGetAuth } from "@/lib/api";

export type HomepageGiftPromoProductOption = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  stock: number;
};

export type HomepageGiftPromoApiProduct = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  stock?: number;
  isActive?: boolean;
};

export type HomepageGiftPromoLoadResult = {
  promo: {
    product?: HomepageGiftPromoApiProduct | null;
    discountPercent?: number;
    isActive?: boolean;
    sectionKicker?: string;
    sectionDescription?: string;
  };
  products: HomepageGiftPromoProductOption[];
};

let inflight: Promise<HomepageGiftPromoLoadResult> | null = null;
let last: { token: string; at: number; data: HomepageGiftPromoLoadResult } | null = null;

const STALE_MS = 2500;

export function invalidateHomepageGiftPromoEditorCache(): void {
  last = null;
}

/** Coalesces the promo + product list requests used by the admin homepage gift editor. */
export async function fetchHomepageGiftPromoEditorData(
  token: string
): Promise<HomepageGiftPromoLoadResult> {
  const now = Date.now();
  if (last && last.token === token && now - last.at < STALE_MS) {
    return last.data;
  }
  if (!inflight) {
    inflight = (async () => {
      const [promoRes, prodRes] = await Promise.all([
        apiGetAuth<{ promo: HomepageGiftPromoLoadResult["promo"] }>("/api/admin/homepage-gift-promo", token),
        apiGetAuth<{ products: HomepageGiftPromoProductOption[] }>(
          "/api/admin/products?limit=200&sort=name",
          token
        ),
      ]);
      const data: HomepageGiftPromoLoadResult = {
        promo: promoRes.promo,
        products: prodRes.products.filter((x) => x._id),
      };
      last = { token, at: Date.now(), data };
      return data;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
