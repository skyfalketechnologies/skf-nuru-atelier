"use client";

import { trackViewItem } from "@/lib/gtm-ecommerce";
import { useEffect } from "react";

type ProductPayload = {
  _id: string;
  name: string;
  priceKes: number;
  category?: { name: string; slug?: string };
  brand?: { name: string; slug?: string };
};

/** Fires `view_item` when the product detail route is shown. */
export function GtmProductViewTracker({ product }: { product: ProductPayload }) {
  useEffect(() => {
    trackViewItem(
      {
        _id: product._id,
        name: product.name,
        priceKes: product.priceKes,
        category: product.category,
        brand: product.brand,
      },
      { listId: "product_detail", listName: "Product detail" }
    );
  }, [product._id, product.name, product.priceKes, product.category?.name, product.brand?.name]);

  return null;
}
