"use client";

import { trackViewItemList } from "@/lib/gtm-ecommerce";
import { useEffect, useRef } from "react";

type ListingProduct = {
  _id: string;
  name: string;
  priceKes: number;
  category?: { name: string; slug?: string };
  brand?: { name: string; slug?: string };
};

/** Fires `view_item_list` when the shop listing or filters change. */
export function GtmShopListingView({
  products,
  listId,
  listName,
}: {
  products: ListingProduct[];
  listId: string;
  listName: string;
}) {
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${listId}|${products.map((p) => p._id).join(",")}`;
    if (prevKey.current === key) return;
    prevKey.current = key;
    trackViewItemList(products, { listId, listName });
  }, [products, listId, listName]);

  return null;
}
