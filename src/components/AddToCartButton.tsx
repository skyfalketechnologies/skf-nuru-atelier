"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type Props = {
  productId: string;
  name: string;
  priceKes: number;
};

export function AddToCartButton({ productId, name, priceKes }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <button
      className="mt-6 rounded-full bg-gold px-6 py-3 text-black"
      onClick={() => {
        addToCart({ productId, name, priceKes, quantity: 1 });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}

