import type { CartItem } from "@/lib/cart";

declare global {
  interface Window {
    fbq?: (
      action: "init" | "track" | "trackCustom",
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

const FB_CURRENCY = "KES";

type FbqContentLine = { id: string; quantity: number; item_price: number };

function cartToFbqContents(items: CartItem[]): FbqContentLine[] {
  return items.map((i) => ({
    id: i.productId,
    quantity: i.quantity,
    item_price: i.priceKes,
  }));
}

function cartToContentIds(items: CartItem[]): string[] {
  return items.map((i) => i.productId);
}

function cartNumItems(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}

/** Standard or custom event (after `init` runs in the base snippet). */
export function fbqTrack(
  eventName: string,
  params?: Record<string, unknown>,
  custom = false
): void {
  if (typeof window === "undefined" || !window.fbq) return;
  if (custom) {
    window.fbq("trackCustom", eventName, params);
  } else {
    window.fbq("track", eventName, params);
  }
}

export function fbqPageView(): void {
  fbqTrack("PageView");
}

export function fbqViewContent(product: { _id: string; name: string; priceKes: number }): void {
  fbqTrack("ViewContent", {
    content_ids: [product._id],
    content_type: "product",
    content_name: product.name,
    value: product.priceKes,
    currency: FB_CURRENCY,
  });
}

export function fbqAddToCart(item: CartItem): void {
  fbqTrack("AddToCart", {
    currency: FB_CURRENCY,
    value: item.priceKes * item.quantity,
    content_ids: [item.productId],
    content_type: "product",
    contents: [{ id: item.productId, quantity: item.quantity, item_price: item.priceKes }],
  });
}

export function fbqRemoveFromCart(item: CartItem, quantityRemoved: number): void {
  if (quantityRemoved <= 0) return;
  fbqTrack(
    "RemoveFromCart",
    {
      currency: FB_CURRENCY,
      value: item.priceKes * quantityRemoved,
      content_ids: [item.productId],
      content_type: "product",
      contents: [{ id: item.productId, quantity: quantityRemoved, item_price: item.priceKes }],
    },
    true
  );
}

export function fbqViewCart(items: CartItem[], valueKes: number): void {
  if (!items.length) return;
  fbqTrack(
    "ViewCart",
    {
      currency: FB_CURRENCY,
      value: valueKes,
      content_ids: cartToContentIds(items),
      content_type: "product",
      contents: cartToFbqContents(items),
      num_items: cartNumItems(items),
    },
    true
  );
}

export function fbqInitiateCheckout(items: CartItem[], valueKes: number): void {
  if (!items.length) return;
  fbqTrack("InitiateCheckout", {
    currency: FB_CURRENCY,
    value: valueKes,
    content_ids: cartToContentIds(items),
    content_type: "product",
    contents: cartToFbqContents(items),
    num_items: cartNumItems(items),
  });
}

export type FbqPurchaseSnapshot = {
  transaction_id: string;
  value: number;
  items: CartItem[];
};

export function fbqPurchase(snap: FbqPurchaseSnapshot): void {
  if (!snap.items.length) return;
  fbqTrack("Purchase", {
    currency: FB_CURRENCY,
    value: snap.value,
    content_ids: cartToContentIds(snap.items),
    content_type: "product",
    contents: cartToFbqContents(snap.items),
    num_items: cartNumItems(snap.items),
    order_id: snap.transaction_id,
  });
}
