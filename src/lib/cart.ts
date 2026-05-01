export interface CartItem {
  productId: string;
  name: string;
  priceKes: number;
  quantity: number;
}

const CART_KEY = "nuru_cart";
const CART_BACKUP_KEY = "nuru_cart_backup";
export const CART_UPDATED_EVENT = "nuru:cart-updated";

function sanitizeCartValue(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => ({
      productId: typeof item?.productId === "string" ? item.productId : "",
      name: typeof item?.name === "string" ? item.name : "Item",
      priceKes: Number(item?.priceKes),
      quantity: Math.max(0, Math.floor(Number(item?.quantity))),
    }))
    .filter((item) => item.productId && Number.isFinite(item.priceKes) && item.priceKes >= 0 && item.quantity > 0);
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = sanitizeCartValue(JSON.parse(raw));
    if (parsed.length > 0) return parsed;
  } catch {
    // fallback to backup store below
  }
  try {
    const backupRaw = sessionStorage.getItem(CART_BACKUP_KEY);
    if (!backupRaw) return [];
    return sanitizeCartValue(JSON.parse(backupRaw));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  const sanitized = sanitizeCartValue(items);
  const serialized = JSON.stringify(sanitized);
  localStorage.setItem(CART_KEY, serialized);
  sessionStorage.setItem(CART_BACKUP_KEY, serialized);
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

