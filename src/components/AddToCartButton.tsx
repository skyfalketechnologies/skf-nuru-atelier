"use client";

import { addToCart } from "@/lib/cart";
import { trackAddToCart } from "@/lib/gtm-ecommerce";
import { useState } from "react";

type Props = {
  productId: string;
  name: string;
  priceKes: number;
  listId?: string;
  listName?: string;
  source?: string;
};

export function AddToCartButton({ productId, name, priceKes, listId, listName, source }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <button
      className="mt-6 rounded-full bg-gold px-6 py-3 text-black"
      onClick={() => {
        const line = { productId, name, priceKes, quantity: 1 };
        addToCart(line);
        trackAddToCart(line, { listId, listName, source });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}

