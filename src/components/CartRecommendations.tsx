"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductGridCard, type ProductGridCardProduct } from "@/components/ProductGridCard";
import type { CartItem } from "@/lib/cart";

type Props = {
  apiUrl: string;
  cart: CartItem[];
};

export function CartRecommendations({ apiUrl, cart }: Props) {
  const [products, setProducts] = useState<ProductGridCardProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const cartProductIdsKey = useMemo(
    () => [...new Set(cart.map((item) => item.productId))].sort().join(","),
    [cart]
  );

  useEffect(() => {
    if (!cartProductIdsKey) {
      setProducts([]);
      return;
    }

    const productIds = cartProductIdsKey.split(",").filter(Boolean);
    const ac = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const res = await fetch(`${apiUrl}/api/catalog/recommendations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productIds,
            limit: 8,
          }),
          signal: ac.signal,
        });
        if (!res.ok) {
          setProducts([]);
          return;
        }
        const data = (await res.json()) as { products?: ProductGridCardProduct[] };
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setProducts([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [apiUrl, cartProductIdsKey]);

  if (!cart.length) return null;

  return (
    <div className="mt-12 border-t border-gold/15 pt-10">
      <h2 className="section-title text-2xl text-gold sm:text-3xl">You may also like</h2>
      <p className="mt-2 text-sm text-muted">Most customers also liked these products.</p>
      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading suggestions…</p>
      ) : products.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductGridCard
              key={product._id}
              product={product}
              gtm={{
                listId: "cart_recommendations",
                listName: "Cart recommendations",
                index,
              }}
              listIdForCart="cart_recommendations"
              listNameForCart="Cart recommendations"
              source="cart_recommendations"
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">No suggestions right now. Browse the shop for more.</p>
      )}
    </div>
  );
}
