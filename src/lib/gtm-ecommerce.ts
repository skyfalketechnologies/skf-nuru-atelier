import type { CartItem } from "@/lib/cart";
import {
  fbqAddToCart,
  fbqInitiateCheckout,
  fbqPurchase,
  fbqRemoveFromCart,
  fbqViewCart,
  fbqViewContent,
} from "@/lib/fbq";
import { gtmPush } from "@/lib/gtm";

export const GTM_CURRENCY = "KES";

/** GA4 / GTM ecommerce item shape */
export type GtmEcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_brand?: string;
  item_list_id?: string;
  item_list_name?: string;
  index?: number;
};

export function cartItemToGtmItem(item: CartItem, extra?: Partial<GtmEcommerceItem>): GtmEcommerceItem {
  return {
    item_id: item.productId,
    item_name: item.name,
    price: item.priceKes,
    quantity: item.quantity,
    ...extra,
  };
}

type ListContext = { listId?: string; listName?: string };

function withListContext<T extends GtmEcommerceItem>(item: T, ctx?: ListContext): T {
  if (!ctx?.listId && !ctx?.listName) return item;
  return {
    ...item,
    ...(ctx.listId ? { item_list_id: ctx.listId } : {}),
    ...(ctx.listName ? { item_list_name: ctx.listName } : {}),
  };
}

export function trackViewItemList(
  products: {
    _id: string;
    name: string;
    priceKes: number;
    category?: { name: string };
    brand?: { name: string };
  }[],
  ctx: { listId: string; listName: string }
): void {
  if (!products.length) return;
  const items: GtmEcommerceItem[] = products.map((p, i) => ({
    item_id: p._id,
    item_name: p.name,
    price: p.priceKes,
    index: i + 1,
    item_category: p.category?.name,
    item_brand: p.brand?.name,
    item_list_id: ctx.listId,
    item_list_name: ctx.listName,
  }));
  gtmPush({
    event: "view_item_list",
    ecommerce: {
      currency: GTM_CURRENCY,
      item_list_id: ctx.listId,
      item_list_name: ctx.listName,
      items,
    },
  });
}

export function trackSelectItem(
  product: {
    _id: string;
    name: string;
    priceKes: number;
    category?: { name: string };
    brand?: { name: string };
  },
  ctx: { listId: string; listName: string; index: number }
): void {
  gtmPush({
    event: "select_item",
    ecommerce: {
      item_list_id: ctx.listId,
      item_list_name: ctx.listName,
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.priceKes,
          index: ctx.index,
          item_category: product.category?.name,
          item_brand: product.brand?.name,
          item_list_id: ctx.listId,
          item_list_name: ctx.listName,
        },
      ],
    },
  });
}

export function trackViewItem(
  product: {
    _id: string;
    name: string;
    priceKes: number;
    category?: { name: string };
    brand?: { name: string };
  },
  ctx?: ListContext
): void {
  const item = withListContext(
    {
      item_id: product._id,
      item_name: product.name,
      price: product.priceKes,
      item_category: product.category?.name,
      item_brand: product.brand?.name,
    },
    ctx
  );
  gtmPush({
    event: "view_item",
    ecommerce: {
      currency: GTM_CURRENCY,
      value: product.priceKes,
      items: [item],
    },
  });
  fbqViewContent({ _id: product._id, name: product.name, priceKes: product.priceKes });
}

export function trackAddToCart(item: CartItem, ctx?: ListContext & { source?: string }): void {
  const gtmItem = withListContext(cartItemToGtmItem(item), ctx);
  gtmPush({
    event: "add_to_cart",
    ecommerce: {
      currency: GTM_CURRENCY,
      value: item.priceKes * item.quantity,
      items: [gtmItem],
    },
    ...(ctx?.source ? { event_source: ctx.source } : {}),
  });
  fbqAddToCart(item);
}

export function trackRemoveFromCart(item: CartItem, quantityRemoved: number): void {
  if (quantityRemoved <= 0) return;
  gtmPush({
    event: "remove_from_cart",
    ecommerce: {
      currency: GTM_CURRENCY,
      value: item.priceKes * quantityRemoved,
      items: [
        {
          item_id: item.productId,
          item_name: item.name,
          price: item.priceKes,
          quantity: quantityRemoved,
        },
      ],
    },
  });
  fbqRemoveFromCart(item, quantityRemoved);
}

export function trackViewCart(items: CartItem[], cartValueKes: number): void {
  if (!items.length) return;
  gtmPush({
    event: "view_cart",
    ecommerce: {
      currency: GTM_CURRENCY,
      value: cartValueKes,
      items: items.map((i) => cartItemToGtmItem(i)),
    },
  });
  fbqViewCart(items, cartValueKes);
}

export function trackBeginCheckout(items: CartItem[], valueKes: number): void {
  if (!items.length) return;
  gtmPush({
    event: "begin_checkout",
    ecommerce: {
      currency: GTM_CURRENCY,
      value: valueKes,
      items: items.map((i) => cartItemToGtmItem(i)),
    },
  });
  fbqInitiateCheckout(items, valueKes);
}

export type PurchaseSnapshot = {
  transaction_id: string;
  value: number;
  shipping: number;
  items: CartItem[];
};

export function trackPurchase(snap: PurchaseSnapshot): void {
  gtmPush({
    event: "purchase",
    ecommerce: {
      currency: GTM_CURRENCY,
      transaction_id: snap.transaction_id,
      value: snap.value,
      shipping: snap.shipping,
      items: snap.items.map((i) => cartItemToGtmItem(i)),
    },
  });
  fbqPurchase({
    transaction_id: snap.transaction_id,
    value: snap.value,
    items: snap.items,
  });
}
