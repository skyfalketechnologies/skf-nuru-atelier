export interface CartItem {
  productId: string;
  name: string;
  priceKes: number;
  quantity: number;
  /** In-stock cap when known (real catalog SKUs). Omitted for synthetic lines (e.g. gift builder). */
  stock?: number;
}

const CART_KEY = "nuru_cart";
const CART_BACKUP_KEY = "nuru_cart_backup";
export const CART_UPDATED_EVENT = "nuru:cart-updated";

function normalizeStock(raw: unknown): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.floor(n);
}

function maxQuantityForStock(stock: number | undefined): number {
  if (stock === undefined) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor(stock));
}

/** Prefer the freshest stock value when merging (e.g. repeat add-to-cart). */
function coalesceStock(existing: number | undefined, incoming: number | undefined): number | undefined {
  if (incoming !== undefined && Number.isFinite(incoming)) return Math.max(0, Math.floor(incoming));
  if (existing !== undefined && Number.isFinite(existing)) return Math.max(0, Math.floor(existing));
  return undefined;
}

function sanitizeCartValue(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const stock = normalizeStock(item?.stock);
      let quantity = Math.max(0, Math.floor(Number(item?.quantity)));
      const cap = maxQuantityForStock(stock);
      if (Number.isFinite(cap)) quantity = Math.min(quantity, cap);
      const out: CartItem = {
        productId: typeof item?.productId === "string" ? item.productId : "",
        name: typeof item?.name === "string" ? item.name : "Item",
        priceKes: Number(item?.priceKes),
        quantity,
      };
      if (stock !== undefined) out.stock = stock;
      return out;
    })
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
  const incomingQty = Math.max(0, Math.floor(Number(nextItem.quantity)) || 0);
  if (incomingQty <= 0) return;

  const existing = current.find((item) => item.productId === nextItem.productId);
  if (existing) {
    const mergedStock = coalesceStock(existing.stock, normalizeStock(nextItem.stock));
    const cap = maxQuantityForStock(mergedStock);
    existing.stock = mergedStock;
    existing.quantity = Math.min(existing.quantity + incomingQty, cap);
  } else {
    const stock = coalesceStock(undefined, normalizeStock(nextItem.stock));
    const cap = maxQuantityForStock(stock);
    const q = Math.min(incomingQty, cap);
    if (q <= 0) return;
    const line: CartItem = {
      productId: nextItem.productId,
      name: nextItem.name,
      priceKes: nextItem.priceKes,
      quantity: q,
    };
    if (stock !== undefined) line.stock = stock;
    current.push(line);
  }
  writeCart(current);
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const current = readCart();
  const next = current
    .map((item) => {
      if (item.productId !== productId) return item;
      const cap = maxQuantityForStock(item.stock);
      const q = Math.min(Math.max(0, Math.floor(quantity)), cap);
      return { ...item, quantity: q };
    })
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

/** Clamp quantities and attach `stock` from the server map (catalog product ObjectIds only). */
export function syncCartStocksFromServer(stocks: Record<string, number>) {
  const current = readCart();
  const next = current
    .map((item) => {
      if (!Object.prototype.hasOwnProperty.call(stocks, item.productId)) return item;
      const stock = Math.max(0, Math.floor(Number(stocks[item.productId])));
      const cap = maxQuantityForStock(stock);
      return { ...item, stock, quantity: Math.min(item.quantity, cap) };
    })
    .filter((item) => item.quantity > 0);
  writeCart(next);
}

