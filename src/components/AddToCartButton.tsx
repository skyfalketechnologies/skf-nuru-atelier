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
  /** Wider PDP-style vs compact full-width grid CTA */
  variant?: "default" | "compact";
  disabled?: boolean;
  className?: string;
};

export function AddToCartButton({
  productId,
  name,
  priceKes,
  listId,
  listName,
  source,
  variant = "default",
  disabled = false,
  className = "",
}: Props) {
  const [added, setAdded] = useState(false);

  const compactClasses = disabled
    ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-muted"
    : added
      ? "border border-emerald-500/35 bg-emerald-500/12 text-emerald-100"
      : "border border-gold/40 bg-gold text-black hover:bg-gold/90";

  const defaultClasses = disabled
    ? "cursor-not-allowed bg-neutral-700 text-muted"
    : "bg-gold hover:bg-gold/90";

  const label = disabled ? "Out of stock" : added ? "Added" : "Add to cart";

  return (
    <button
      type="button"
      disabled={disabled}
      className={
        variant === "compact"
          ? `mt-0 w-full rounded-lg px-4 py-2.5 text-sm font-medium tracking-wide transition ${compactClasses} ${className}`.trim()
          : `mt-6 rounded-full px-6 py-3 text-black transition ${defaultClasses} ${className}`.trim()
      }
      onClick={() => {
        if (disabled) return;
        const line = { productId, name, priceKes, quantity: 1 };
        addToCart(line);
        trackAddToCart(line, { listId, listName, source });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {label}
    </button>
  );
}

