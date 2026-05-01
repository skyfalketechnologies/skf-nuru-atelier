"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { trackAddToCart } from "@/lib/gtm-ecommerce";

type Props = {
  productId: string;
  name: string;
  discountedPriceKes: number;
  slug: string;
  inStock: boolean;
};

export function HomepageGiftPromoAddToCart({
  productId,
  name,
  discountedPriceKes,
  slug,
  inStock,
}: Props) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <p className="mt-6 text-sm text-muted">This offer is currently out of stock. Browse the shop for more picks.</p>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
        disabled={added}
        onClick={() => {
          const line = { productId, name, priceKes: discountedPriceKes, quantity: 1 };
          addToCart(line);
          trackAddToCart(line, {
            listId: "homepage_gift_promo",
            listName: "Homepage gift promo",
            source: "homepage_promo",
          });
          setAdded(true);
          router.push("/cart");
        }}
      >
        {added ? "Added — view cart" : "Add offer to cart"}
      </button>
      <Link
        href={`/shop/${slug}`}
        className="inline-flex items-center rounded-full border border-gold/40 px-6 py-3 text-sm text-gold hover:bg-gold/10"
      >
        View product
      </Link>
    </div>
  );
}
