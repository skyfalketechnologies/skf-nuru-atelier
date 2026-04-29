export interface CartItem {
  productId: string;
  name: string;
  priceKes: number;
  quantity: number;
}

const CART_KEY = "nuru_cart";
export const CART_UPDATED_EVENT = "nuru:cart-updated";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(nextItem: CartItem) {
  const current = readCart();
  const existing = current.find((item) => item.productId === nextItem.productId);
  if (existing) {
    existing.quantity += nextItem.quantity;
  } else {
    current.push(nextItem);
  }
  writeCart(current);
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const current = readCart();
  const next = current
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  writeCart(next);
}

export function removeFromCart(productId: string) {
  const current = readCart();
  writeCart(current.filter((item) => item.productId !== productId));
}

export function clearCart() {
  writeCart([]);
}

