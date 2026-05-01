"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { connectAdminRealtime, type RealtimeEvent } from "@/lib/realtime";
import { Toast } from "@/components/admin/Toast";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "payment_failed";
const ORDER_STATUS_OPTIONS: OrderStatus[] = ["pending", "paid", "payment_failed", "shipped", "delivered"];

type PaymentStatus = "pending" | "initiated" | "paid" | "failed";
type SortKey = "newest" | "oldest" | "total_desc" | "total_asc" | "status";

type OrderItem = {
  product: string;
  name: string;
  image?: string;
  priceKes: number;
  quantity: number;
};

type AdminOrder = {
  _id: string;
  publicOrderId?: string;
  guestEmail?: string;
  items: OrderItem[];
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  currency?: "KES";
  shippingAddress: {
    fullName: string;
    city: string;
    phone: string;
    area?: string;
    addressLine: string;
  };
  giftCustomization?: {
    message?: string;
    packagingStyle?: string;
  };
  createdAt: string;
};

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [shippedCount, setShippedCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [paymentFailedCount, setPaymentFailedCount] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [expandedOrderId, setExpandedOrderId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [liveConnected, setLiveConnected] = useState(false);
  const [queryHydratedFromUrl, setQueryHydratedFromUrl] = useState(false);

  async function loadOrders(targetPage = page, targetPageSize = pageSize) {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      setToastTone("error");
      setLoading(false);
      return;
    }
    try {
      const data = await apiGetAuth<{
        orders: AdminOrder[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
        summary?: {
          catalogTotal: number;
          pendingCount: number;
          paidCount: number;
          shippedCount: number;
          deliveredCount: number;
          paymentFailedCount: number;
        };
      }>(
        `/api/orders/admin/all?page=${targetPage}&limit=${targetPageSize}&q=${encodeURIComponent(
          debouncedQuery
        )}&status=${statusFilter}&paymentStatus=${paymentStatusFilter}&sort=${sortKey}`,
        token
      );
      setOrders(data.orders);
      setPage(data.pagination?.page ?? targetPage);
      setPageSize(data.pagination?.limit ?? targetPageSize);
      setTotalOrders(data.pagination?.total ?? data.orders.length);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCatalogTotal(data.summary?.catalogTotal ?? data.pagination?.total ?? data.orders.length);
      setPendingCount(data.summary?.pendingCount ?? 0);
      setPaidCount(data.summary?.paidCount ?? 0);
      setShippedCount(data.summary?.shippedCount ?? 0);
      setDeliveredCount(data.summary?.deliveredCount ?? 0);
      setPaymentFailedCount(data.summary?.paymentFailedCount ?? 0);
    } catch {
      setMessage("Unable to load orders.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (queryHydratedFromUrl) return;
    const linkedQuery = String(searchParams.get("q") || "").trim();
    if (!linkedQuery) {
      setQueryHydratedFromUrl(true);
      return;
    }
    setQuery(linkedQuery);
    setDebouncedQuery(linkedQuery);
    setPage(1);
    setQueryHydratedFromUrl(true);
  }, [queryHydratedFromUrl, searchParams]);

  useEffect(() => {
    loadOrders(1, pageSize);
  }, [debouncedQuery, statusFilter, paymentStatusFilter, sortKey]);

  useEffect(() => {
    return connectAdminRealtime(
      (event: RealtimeEvent) => {
        if (event.type === "order.created" || event.type === "order.updated") {
          const payload = (event.payload || {}) as {
            publicOrderId?: string;
            status?: string;
            source?: string;
          };
          if (event.type === "order.created") {
            const ref = payload.publicOrderId || "new order";
            const source = payload.source === "pos" ? "POS" : "checkout";
            setMessage(`Live: ${source} order ${ref} created.`);
            setToastTone("info");
          } else {
            const ref = payload.publicOrderId || "order";
            const nextStatus = payload.status || "updated";
            setMessage(`Live: ${ref} status changed to ${nextStatus}.`);
            setToastTone("info");
          }
          loadOrders(page, pageSize);
        }
      },
      setLiveConnected
    );
  }, [page, pageSize]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const token = getAuthToken();
    if (!token) return;
    setUpdatingOrderId(orderId);
    try {
      await apiPatchAuth(`/api/orders/admin/${orderId}/status`, { status }, token);
      await loadOrders(page, pageSize);
      setMessage(`Order status set to ${status}.`);
      setToastTone("success");
    } catch {
      setMessage("Failed to update order status.");
      setToastTone("error");
    } finally {
      setUpdatingOrderId("");
    }
  }

  async function copyOrderReference(order: AdminOrder) {
    const orderRef = order.publicOrderId || order._id;
    try {
      await navigator.clipboard.writeText(orderRef);
      setMessage(`Copied order reference: ${orderRef}`);
      setToastTone("success");
    } catch {
      setMessage("Could not copy order reference.");
      setToastTone("error");
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Order operations</p>
        <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Orders</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Review, filter, and progress customer orders across payment and fulfillment stages.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Total</p>
            <p className="mt-1 text-2xl text-gold tabular-nums">{catalogTotal}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Pending</p>
            <p className="mt-1 text-2xl text-amber-200/90 tabular-nums">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Paid</p>
            <p className="mt-1 text-2xl text-emerald-200/90 tabular-nums">{paidCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Shipped</p>
            <p className="mt-1 text-2xl text-sky-200/90 tabular-nums">{shippedCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Delivered</p>
            <p className="mt-1 text-2xl text-gold tabular-nums">{deliveredCount}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadOrders(page, pageSize)}
            className="rounded-full border border-gold/35 px-5 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
            disabled={loading}
          >
            Refresh
          </button>
          <p className="text-xs text-muted">
            Payment failed: <span className="text-red-300/90">{paymentFailedCount}</span>
          </p>
          <p className={`rounded-full border px-2 py-1 text-[11px] ${liveConnected ? "border-emerald-500/50 text-emerald-200" : "border-amber-500/40 text-amber-100"}`}>
            Live updates: {liveConnected ? "connected" : "disconnected"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Order Queue</h2>
            <p className="mt-1 text-xs text-muted">Search by order ref, name, phone, city, email, payment ref</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              className="w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted sm:min-w-[220px]"
              placeholder="Search orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-xs text-foreground sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
            >
              <option value="all">All order statuses</option>
              {ORDER_STATUS_OPTIONS.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-xs text-foreground sm:text-sm"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as "all" | PaymentStatus)}
            >
              <option value="all">All payment states</option>
              <option value="pending">pending</option>
              <option value="initiated">initiated</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
            </select>
            <select
              className="rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-xs text-foreground sm:text-sm"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="total_desc">Total (high to low)</option>
              <option value="total_asc">Total (low to high)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-xl border border-gold/20 bg-white/5" />
            ))
          : null}
        {!loading && orders.length === 0 ? (
          <div className="rounded-xl border border-gold/20 bg-black/25 p-8 text-center text-sm text-muted">
            No orders match this search/filter combination.
          </div>
        ) : null}
        {orders.map((order) => (
          <div key={order._id} className="luxury-card rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted">
                {order.shippingAddress.fullName} - {order.shippingAddress.city}
              </p>
              <p className="text-sm text-gold">Ksh {order.totalKes.toLocaleString()}</p>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-gold">Order Ref: {order.publicOrderId || order._id}</p>
              <button
                type="button"
                onClick={() => copyOrderReference(order)}
                className="rounded-full border border-gold/40 px-2 py-0.5 text-[11px] text-gold hover:bg-gold/10"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() =>
                  setExpandedOrderId((current) => (current === order._id ? "" : order._id))
                }
                className="rounded-full border border-gold/40 px-2 py-0.5 text-[11px] text-gold hover:bg-gold/10"
              >
                {expandedOrderId === order._id ? "Hide Details" : "View Details"}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              Ref: {order.paymentReference || "N/A"} | {new Date(order.createdAt).toLocaleString()}
            </p>
            <div className="mt-3">
              <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-muted">Update Status</label>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                disabled={updatingOrderId === order._id}
                className="w-full rounded-lg border border-gold/40 bg-black/40 px-3 py-2 text-xs text-foreground"
              >
                {ORDER_STATUS_OPTIONS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            {expandedOrderId === order._id ? (
              <div className="mt-4 grid gap-4 rounded-xl border border-gold/20 bg-black/30 p-4 text-xs text-muted lg:grid-cols-2">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.12em] text-gold">Customer & Shipping</h3>
                  <p className="mt-2 text-foreground">Name: {order.shippingAddress.fullName}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                  <p>City: {order.shippingAddress.city}</p>
                  <p>Area: {order.shippingAddress.area || "N/A"}</p>
                  <p>Address: {order.shippingAddress.addressLine}</p>
                  <p>Email: {order.guestEmail || "Registered customer"}</p>
                </div>
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.12em] text-gold">Payment & Totals</h3>
                  <p className="mt-2">Status: <span className="text-foreground">{order.paymentStatus || "pending"}</span></p>
                  <p>Method: <span className="text-foreground">{order.paymentMethod || "mpesa_paybill"}</span></p>
                  <p>Subtotal: <span className="text-foreground">Ksh {order.subtotalKes.toLocaleString()}</span></p>
                  <p>Delivery fee: <span className="text-foreground">Ksh {order.deliveryFeeKes.toLocaleString()}</span></p>
                  <p>Total: <span className="text-foreground">Ksh {order.totalKes.toLocaleString()}</span></p>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-[11px] uppercase tracking-[0.12em] text-gold">Ordered Items</h3>
                  <div className="mt-2 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={`${item.product}-${idx}`} className="rounded-lg border border-gold/15 bg-black/25 p-2">
                        <p className="text-foreground">{item.name}</p>
                        <p>
                          Qty {item.quantity} x Ksh {item.priceKes.toLocaleString()} ={" "}
                          <span className="text-foreground">
                            Ksh {(item.priceKes * item.quantity).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {order.giftCustomization ? (
                  <div className="lg:col-span-2">
                    <h3 className="text-[11px] uppercase tracking-[0.12em] text-gold">Gift Customization</h3>
                    <p className="mt-2">Packaging: <span className="text-foreground">{order.giftCustomization.packagingStyle || "N/A"}</span></p>
                    <p>Message: <span className="text-foreground">{order.giftCustomization.message || "No gift message"}</span></p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Page {page} of {totalPages} · Showing {orders.length} of {totalOrders} matching orders
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted">
            Per page
            <select
              className="rounded-lg border border-gold/35 bg-black/35 px-3 py-1.5 text-xs text-foreground"
              value={pageSize}
              onChange={(e) => loadOrders(1, Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded-lg border border-gold/35 px-3 py-1.5 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
            disabled={loading || page <= 1}
            onClick={() => loadOrders(page - 1, pageSize)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border border-gold/35 px-3 py-1.5 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
            disabled={loading || page >= totalPages}
            onClick={() => loadOrders(page + 1, pageSize)}
          >
            Next
          </button>
        </div>
      </div>
      </div>
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}

