"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGetAuth, apiPostAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { connectAdminRealtime, type RealtimeEvent } from "@/lib/realtime";
import { Toast } from "@/components/admin/Toast";

type Product = {
  _id: string;
  name: string;
  slug: string;
  stock: number;
  priceKes: number;
  images?: string[];
};

type CartLine = {
  product: Product;
  quantity: number;
};

type PosReceipt = {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; priceKes: number }>;
  subtotalKes: number;
  amountReceivedKes: number;
  changeDueKes: number;
  paymentState: "pending" | "paid";
  createdAt: string;
};

export default function AdminPosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentState, setPaymentState] = useState<"pending" | "paid">("paid");
  const [amountReceivedKes, setAmountReceivedKes] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [lastOrderRef, setLastOrderRef] = useState("");
  const [lastReceipt, setLastReceipt] = useState<PosReceipt | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);

  async function loadProducts(search = "") {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetAuth<{ products: Product[] }>(
        `/api/admin/inventory?page=1&limit=80&sort=name&stock=all&q=${encodeURIComponent(search)}`,
        token
      );
      setProducts(data.products || []);
    } catch {
      setMessage("Unable to load products for POS.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    return connectAdminRealtime(
      (event: RealtimeEvent) => {
        if (event.type === "inventory.updated" || event.type === "order.created") {
          const payload = (event.payload || {}) as {
            publicOrderId?: string;
            source?: string;
            name?: string;
            stock?: number;
          };
          if (event.type === "order.created") {
            const ref = payload.publicOrderId || "new order";
            const source = payload.source === "pos" ? "POS" : "checkout";
            setMessage(`Live: ${source} order ${ref} received.`);
            setToastTone("info");
          } else if (payload.name && typeof payload.stock === "number") {
            setMessage(`Live: ${payload.name} stock now ${payload.stock}.`);
            setToastTone("info");
          }
          loadProducts();
        }
      },
      setLiveConnected
    );
  }, []);

  function addToCart(product: Product) {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev[product._id];
      const nextQty = Math.min(product.stock, (existing?.quantity || 0) + 1);
      return {
        ...prev,
        [product._id]: { product, quantity: nextQty },
      };
    });
  }

  function setQty(productId: string, quantity: number) {
    setCart((prev) => {
      const line = prev[productId];
      if (!line) return prev;
      if (quantity <= 0) {
        const { [productId]: _removed, ...rest } = prev;
        return rest;
      }
      const safeQty = Math.min(line.product.stock, Math.max(1, quantity));
      return { ...prev, [productId]: { ...line, quantity: safeQty } };
    });
  }

  const cartLines = useMemo(() => Object.values(cart), [cart]);
  const subtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.product.priceKes * line.quantity, 0),
    [cartLines]
  );
  const amountReceivedNum = Number(amountReceivedKes || "0");
  const changeDueKes =
    paymentState === "paid" && Number.isFinite(amountReceivedNum)
      ? Math.max(0, amountReceivedNum - subtotal)
      : 0;

  async function submitWalkInOrder() {
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      setToastTone("error");
      return;
    }
    if (!customerName.trim()) {
      setMessage("Customer name is required.");
      setToastTone("error");
      return;
    }
    if (!cartLines.length) {
      setMessage("Add at least one product to the POS cart.");
      setToastTone("error");
      return;
    }
    if (paymentState === "paid") {
      if (!Number.isFinite(amountReceivedNum) || amountReceivedNum < subtotal) {
        setMessage("Amount received must cover the sale total for paid walk-in orders.");
        setToastTone("error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await apiPostAuth<{ order: { publicOrderId: string } }>(
        "/api/admin/pos/orders",
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          paymentState,
          note: note.trim() || undefined,
          items: cartLines.map((line) => ({
            productId: line.product._id,
            quantity: line.quantity,
          })),
        },
        token
      );
      setLastOrderRef(result.order.publicOrderId);
      setLastReceipt({
        orderRef: result.order.publicOrderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        items: cartLines.map((line) => ({
          name: line.product.name,
          quantity: line.quantity,
          priceKes: line.product.priceKes,
        })),
        subtotalKes: subtotal,
        amountReceivedKes: paymentState === "paid" ? amountReceivedNum : 0,
        changeDueKes: paymentState === "paid" ? Math.max(0, amountReceivedNum - subtotal) : 0,
        paymentState,
        createdAt: new Date().toISOString(),
      });
      setMessage(`Walk-in order created: ${result.order.publicOrderId}`);
      setToastTone("success");
      setCart({});
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setAmountReceivedKes("");
      setNote("");
      await loadProducts(query.trim());
    } catch {
      setMessage("POS order failed. Confirm stock and customer details.");
      setToastTone("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="print-hide rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-gold/80">In-Store Checkout</p>
        <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Retail Sales Terminal</h1>
        <p className="mt-1 text-sm text-muted">
          Process walk-in purchases.
        </p>
        <p className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[11px] ${liveConnected ? "border-emerald-500/50 text-emerald-200" : "border-amber-500/40 text-amber-100"}`}>
          Live updates: {liveConnected ? "connected" : "disconnected"}
        </p>
        {lastOrderRef ? (
          <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">
            Last POS order reference: <span className="font-mono">{lastOrderRef}</span>
          </p>
        ) : null}
      </div>

      <div className="print-hide grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Products</h2>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product..."
                className="rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <button
                type="button"
                className="rounded-lg border border-gold/35 px-3 py-2 text-xs text-gold hover:bg-gold/10"
                onClick={() => loadProducts(query.trim())}
              >
                Search
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
              ))
            ) : products.length ? (
              products.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => addToCart(product)}
                  className="rounded-lg border border-gold/25 bg-black/25 p-3 text-left hover:bg-gold/5 disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-14 w-14 shrink-0 rounded-md border border-gold/20 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-gold/20 bg-black/30 text-[10px] text-muted">
                        No image
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{product.name}</p>
                      <p className="mt-1 text-xs text-muted">Ksh {product.priceKes.toLocaleString()}</p>
                      <p className="mt-1 text-xs text-gold">Stock: {product.stock}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted">No products found.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
          <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Current Sale</h2>
          <div className="mt-3 space-y-2">
            {cartLines.length ? (
              cartLines.map((line) => (
                <div key={line.product._id} className="rounded-lg border border-gold/20 bg-black/25 p-2 text-sm">
                  <div className="flex items-start gap-2">
                    {line.product.images?.[0] ? (
                      <img
                        src={line.product.images[0]}
                        alt={line.product.name}
                        className="h-10 w-10 shrink-0 rounded border border-gold/20 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-gold/20 bg-black/30 text-[9px] text-muted">
                        N/A
                      </div>
                    )}
                    <p className="truncate text-foreground">{line.product.name}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <input
                      type="number"
                      min={1}
                      max={line.product.stock}
                      value={line.quantity}
                      onChange={(e) => setQty(line.product._id, Number(e.target.value || 1))}
                      className="w-20 rounded border border-gold/35 bg-black/35 px-2 py-1 text-xs"
                    />
                    <p className="text-xs text-gold">
                      Ksh {(line.quantity * line.product.priceKes).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No items in POS cart.</p>
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-gold/15 pt-4">
            <label className="block text-xs text-muted">
              Customer name
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded border border-gold/35 bg-black/35 px-3 py-2 text-sm"
                placeholder="Walk-in customer"
              />
            </label>
            <label className="block text-xs text-muted">
              Phone (optional)
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 w-full rounded border border-gold/35 bg-black/35 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-muted">
              Email (optional)
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1 w-full rounded border border-gold/35 bg-black/35 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-muted">
              Payment state
              <select
                value={paymentState}
                onChange={(e) => setPaymentState(e.target.value as "pending" | "paid")}
                className="mt-1 w-full rounded border border-gold/35 bg-black/35 px-3 py-2 text-sm"
              >
                <option value="paid">Paid now</option>
                <option value="pending">Pending payment</option>
              </select>
            </label>
            {paymentState === "paid" ? (
              <label className="block text-xs text-muted">
                Amount received (KES)
                <input
                  type="number"
                  min={0}
                  value={amountReceivedKes}
                  onChange={(e) => setAmountReceivedKes(e.target.value)}
                  className="mt-1 w-full rounded border border-gold/35 bg-black/35 px-3 py-2 text-sm"
                  placeholder="0"
                />
                <span className="mt-1 block text-[11px] text-muted">
                  Change due:{" "}
                  <span className="text-gold">Ksh {changeDueKes.toLocaleString()}</span>
                </span>
              </label>
            ) : null}
            <label className="block text-xs text-muted">
              Note (optional)
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded border border-gold/35 bg-black/35 px-3 py-2 text-sm"
                placeholder="e.g. POS terminal 1"
              />
            </label>
            <div className="rounded-lg border border-gold/20 bg-black/25 p-3">
              <p className="text-xs text-muted">Subtotal</p>
              <p className="text-xl text-gold">Ksh {subtotal.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={submitWalkInOrder}
              disabled={submitting || !cartLines.length}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Complete Walk-in Sale"}
            </button>
          </div>
        </div>
      </div>
      {lastReceipt ? (
        <div className="print-receipt-only rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
          <div className="print-hide mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Printable Receipt</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded border border-gold/35 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
            >
              Print
            </button>
          </div>
          <div className="print-receipt-card rounded-lg border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="font-serif text-gold">NURU ATELIER - POS RECEIPT</p>
            <p className="mt-1 text-xs text-muted">
              Ref: <span className="font-mono text-foreground">{lastReceipt.orderRef}</span> ·{" "}
              {new Date(lastReceipt.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-muted">
              Customer: <span className="text-foreground">{lastReceipt.customerName}</span>
              {lastReceipt.customerPhone ? ` · ${lastReceipt.customerPhone}` : ""}
              {lastReceipt.customerEmail ? ` · ${lastReceipt.customerEmail}` : ""}
            </p>
            <div className="mt-3 space-y-1 border-t border-gold/15 pt-3 text-xs">
              {lastReceipt.items.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2">
                  <span className="text-foreground">
                    {item.quantity} x {item.name}
                  </span>
                  <span>Ksh {(item.quantity * item.priceKes).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-gold/15 pt-3 text-xs">
              <p>Subtotal: Ksh {lastReceipt.subtotalKes.toLocaleString()}</p>
              <p>Payment state: {lastReceipt.paymentState}</p>
              {lastReceipt.paymentState === "paid" ? (
                <>
                  <p>Amount received: Ksh {lastReceipt.amountReceivedKes.toLocaleString()}</p>
                  <p>Change due: Ksh {lastReceipt.changeDueKes.toLocaleString()}</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {message ? <div className="print-hide"><Toast message={message} tone={toastTone} onClose={() => setMessage("")} /></div> : null}
    </section>
  );
}

