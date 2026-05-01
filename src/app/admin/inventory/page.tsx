"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment } from "react";
import { useEffect, useState } from "react";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { connectAdminRealtime, type RealtimeEvent } from "@/lib/realtime";
import { Toast } from "@/components/admin/Toast";

type TaxonomyRef = { _id: string; name: string; slug: string };
type StockFilter = "all" | "low" | "out" | "healthy" | "inactive";
type InventorySort = "stock_asc" | "stock_desc" | "newest" | "name";
type UpdateMode = "set" | "add" | "subtract";

type InventoryProduct = {
  _id: string;
  name: string;
  slug: string;
  stock: number;
  priceKes: number;
  isActive?: boolean;
  images?: string[];
  category?: TaxonomyRef | string;
  brand?: TaxonomyRef | string;
};

type InventoryAdjustment = {
  _id: string;
  mode: UpdateMode;
  quantity: number;
  previousStock: number;
  nextStock: number;
  reason?: string;
  actorRole?: string;
  createdAt: string;
};

export default function AdminInventoryPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortKey, setSortKey] = useState<InventorySort>("stock_asc");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [historyLoadingId, setHistoryLoadingId] = useState("");
  const [expandedHistoryId, setExpandedHistoryId] = useState("");
  const [historyByProductId, setHistoryByProductId] = useState<Record<string, InventoryAdjustment[]>>({});
  const [updateModeById, setUpdateModeById] = useState<Record<string, UpdateMode>>({});
  const [updateQtyById, setUpdateQtyById] = useState<Record<string, number>>({});
  const [updateReasonById, setUpdateReasonById] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [liveConnected, setLiveConnected] = useState(false);
  const [queryHydratedFromUrl, setQueryHydratedFromUrl] = useState(false);

  async function loadInventory(targetPage = page, targetPageSize = pageSize) {
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
        products: InventoryProduct[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
        summary?: { catalogTotal: number; activeCount: number; lowStockCount: number; outOfStockCount: number };
      }>(
        `/api/admin/inventory?page=${targetPage}&limit=${targetPageSize}&q=${encodeURIComponent(
          debouncedQuery
        )}&stock=${stockFilter}&sort=${sortKey}`,
        token
      );
      setProducts(data.products);
      setPage(data.pagination?.page ?? targetPage);
      setPageSize(data.pagination?.limit ?? targetPageSize);
      setTotalProducts(data.pagination?.total ?? data.products.length);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCatalogTotal(data.summary?.catalogTotal ?? data.pagination?.total ?? data.products.length);
      setActiveCount(data.summary?.activeCount ?? 0);
      setLowStockCount(data.summary?.lowStockCount ?? 0);
      setOutOfStockCount(data.summary?.outOfStockCount ?? 0);
    } catch {
      setMessage("Unable to load inventory data.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
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
    loadInventory(1, pageSize);
  }, [debouncedQuery, stockFilter, sortKey]);

  useEffect(() => {
    return connectAdminRealtime(
      (event: RealtimeEvent) => {
        if (event.type === "inventory.updated" || event.type === "order.created") {
          const payload = (event.payload || {}) as {
            publicOrderId?: string;
            name?: string;
            stock?: number;
            mode?: string;
            source?: string;
          };
          if (event.type === "inventory.updated") {
            if (typeof payload.stock === "number" && payload.name) {
              setMessage(`Live: ${payload.name} stock is now ${payload.stock}.`);
            } else if (payload.publicOrderId) {
              setMessage(`Live: inventory adjusted from order ${payload.publicOrderId}.`);
            } else {
              setMessage("Live: inventory updated.");
            }
            setToastTone("info");
          } else {
            const ref = payload.publicOrderId || "new order";
            const source = payload.source === "pos" ? "POS" : "checkout";
            setMessage(`Live: ${source} order ${ref} may affect stock.`);
            setToastTone("info");
          }
          loadInventory(page, pageSize);
          if (expandedHistoryId) loadHistory(expandedHistoryId);
        }
      },
      setLiveConnected
    );
  }, [expandedHistoryId, page, pageSize]);

  async function applyStockUpdate(productId: string) {
    const token = getAuthToken();
    if (!token) return;
    const mode = updateModeById[productId] || "set";
    const quantity = Math.max(0, Number(updateQtyById[productId] ?? 0));
    const reason = String(updateReasonById[productId] || "").trim();
    if (mode === "subtract" && !reason) {
      setMessage("Reason is required when subtracting stock.");
      setToastTone("error");
      return;
    }
    setUpdatingId(productId);
    try {
      await apiPatchAuth(
        `/api/admin/inventory/${productId}/stock`,
        { mode, quantity, ...(reason ? { reason } : {}) },
        token
      );
      setMessage("Stock updated.");
      setToastTone("success");
      setUpdateReasonById((prev) => ({ ...prev, [productId]: "" }));
      await loadInventory(page, pageSize);
      if (expandedHistoryId === productId) {
        await loadHistory(productId);
      }
    } catch {
      setMessage("Stock update failed.");
      setToastTone("error");
    } finally {
      setUpdatingId("");
    }
  }

  function stockPill(stock: number) {
    if (stock <= 0) return "bg-red-500/15 text-red-200";
    if (stock <= 5) return "bg-amber-500/15 text-amber-100";
    return "bg-emerald-500/10 text-emerald-100";
  }

  function refName(ref: TaxonomyRef | string | undefined) {
    if (!ref) return "—";
    return typeof ref === "string" ? "—" : ref.name;
  }

  async function loadHistory(productId: string) {
    const token = getAuthToken();
    if (!token) return;
    setHistoryLoadingId(productId);
    try {
      const data = await apiGetAuth<{ adjustments: InventoryAdjustment[] }>(
        `/api/admin/inventory/${productId}/history`,
        token
      );
      setHistoryByProductId((prev) => ({ ...prev, [productId]: data.adjustments || [] }));
    } catch {
      setMessage("Could not load adjustment history.");
      setToastTone("error");
    } finally {
      setHistoryLoadingId("");
    }
  }

  async function toggleHistory(productId: string) {
    if (expandedHistoryId === productId) {
      setExpandedHistoryId("");
      return;
    }
    setExpandedHistoryId(productId);
    if (!historyByProductId[productId]) {
      await loadHistory(productId);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Inventory control</p>
        <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Inventory</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Monitor stock health and apply quick inventory adjustments without leaving admin.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Total products</p>
            <p className="mt-1 text-2xl text-gold tabular-nums">{catalogTotal}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Active listings</p>
            <p className="mt-1 text-2xl text-emerald-200/90 tabular-nums">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Low stock (1-5)</p>
            <p className="mt-1 text-2xl text-amber-200/90 tabular-nums">{lowStockCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Out of stock</p>
            <p className="mt-1 text-2xl text-red-300/90 tabular-nums">{outOfStockCount}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadInventory(page, pageSize)}
            className="rounded-full border border-gold/35 px-5 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
            disabled={loading}
          >
            Refresh
          </button>
          <Link
            href="/admin/products"
            className="rounded-full border border-gold/35 px-5 py-2 text-sm text-gold hover:bg-gold/10"
          >
            Manage products
          </Link>
          <p className={`rounded-full border px-2 py-1 text-[11px] ${liveConnected ? "border-emerald-500/50 text-emerald-200" : "border-amber-500/40 text-amber-100"}`}>
            Live updates: {liveConnected ? "connected" : "disconnected"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Stock table</h2>
            <p className="mt-1 text-xs text-muted">Search by product, slug, category, or brand</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              className="w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted sm:min-w-[220px]"
              placeholder="Search inventory..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-xs text-foreground sm:text-sm"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            >
              <option value="all">All stock levels</option>
              <option value="low">Low only (1-5)</option>
              <option value="out">Out of stock</option>
              <option value="healthy">Healthy (&gt;5)</option>
              <option value="inactive">Inactive listings</option>
            </select>
            <select
              className="rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-xs text-foreground sm:text-sm"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as InventorySort)}
            >
              <option value="stock_asc">Stock (low to high)</option>
              <option value="stock_desc">Stock (high to low)</option>
              <option value="newest">Newest first</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gold/15">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-black/20 text-left text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Brand</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Adjust stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gold/10">
                    <td className="px-3 py-3" colSpan={6}>
                      <div className="h-10 w-full animate-pulse rounded-lg bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-muted">
                    No inventory rows match your filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const thumb = product.images?.[0];
                  return (
                    <Fragment key={product._id}>
                      <tr key={product._id} className="border-b border-gold/10 hover:bg-white/[0.03]">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-lg border border-gold/20 bg-black/30">
                              {thumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={thumb} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                                  No img
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{product.name}</p>
                              <p className="truncate font-mono text-xs text-muted">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted">{refName(product.category)}</td>
                        <td className="px-3 py-3 text-muted">{refName(product.brand)}</td>
                        <td className="px-3 py-3 tabular-nums">Ksh {product.priceKes.toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs ${stockPill(product.stock)}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={updateModeById[product._id] || "set"}
                                onChange={(e) =>
                                  setUpdateModeById((prev) => ({
                                    ...prev,
                                    [product._id]: e.target.value as UpdateMode,
                                  }))
                                }
                                className="rounded border border-gold/35 bg-black/35 px-2 py-1 text-xs text-foreground"
                                disabled={updatingId === product._id}
                              >
                                <option value="set">Set</option>
                                <option value="add">Add</option>
                                <option value="subtract">Subtract</option>
                              </select>
                              <input
                                type="number"
                                min={0}
                                value={updateQtyById[product._id] ?? 0}
                                onChange={(e) =>
                                  setUpdateQtyById((prev) => ({
                                    ...prev,
                                    [product._id]: Number(e.target.value || 0),
                                  }))
                                }
                                className="w-20 rounded border border-gold/35 bg-black/35 px-2 py-1 text-xs text-foreground"
                                disabled={updatingId === product._id}
                              />
                              <button
                                type="button"
                                onClick={() => applyStockUpdate(product._id)}
                                disabled={updatingId === product._id}
                                className="rounded border border-gold/35 px-2 py-1 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
                              >
                                {updatingId === product._id ? "Saving..." : "Apply"}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleHistory(product._id)}
                                className="rounded border border-gold/35 px-2 py-1 text-xs text-gold hover:bg-gold/10"
                              >
                                {expandedHistoryId === product._id ? "Hide History" : "History"}
                              </button>
                            </div>
                            <input
                              type="text"
                              maxLength={140}
                              value={updateReasonById[product._id] || ""}
                              onChange={(e) =>
                                setUpdateReasonById((prev) => ({
                                  ...prev,
                                  [product._id]: e.target.value,
                                }))
                              }
                              className="w-full rounded border border-gold/25 bg-black/30 px-2 py-1 text-xs text-foreground placeholder:text-muted"
                              placeholder={
                                (updateModeById[product._id] || "set") === "subtract"
                                  ? "Reason required for subtract (e.g. damages, shrinkage)..."
                                  : "Reason (optional): restock, recount..."
                              }
                              disabled={updatingId === product._id}
                            />
                            {(updateModeById[product._id] || "set") === "subtract" &&
                            !String(updateReasonById[product._id] || "").trim() ? (
                              <p className="text-[11px] text-red-300/90">
                                Reason is required when subtracting stock.
                              </p>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                      {expandedHistoryId === product._id ? (
                        <tr className="border-b border-gold/10 bg-black/20">
                          <td colSpan={6} className="px-3 py-3">
                            {historyLoadingId === product._id ? (
                              <div className="h-8 w-full animate-pulse rounded bg-white/10" />
                            ) : historyByProductId[product._id]?.length ? (
                              <div className="space-y-2 text-xs">
                                {historyByProductId[product._id].map((entry) => (
                                  <div
                                    key={entry._id}
                                    className="rounded border border-gold/20 bg-black/25 px-3 py-2 text-muted"
                                  >
                                    <span className="text-foreground">
                                      {entry.mode.toUpperCase()} {entry.quantity}
                                    </span>{" "}
                                    · {entry.previousStock} →{" "}
                                    <span className="text-foreground">{entry.nextStock}</span> ·{" "}
                                    {new Date(entry.createdAt).toLocaleString()} · {entry.actorRole || "staff"}
                                    {entry.reason ? (
                                      <span>
                                        {" "}
                                        · Reason: <span className="text-foreground">{entry.reason}</span>
                                      </span>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted">No adjustment history yet.</p>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Page {page} of {totalPages} · Showing {products.length} of {totalProducts} matching products
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted">
              Per page
              <select
                className="rounded border border-gold/35 bg-black/35 px-2 py-1 text-xs text-foreground"
                value={pageSize}
                onChange={(e) => loadInventory(1, Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded border border-gold/35 px-3 py-1 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
              disabled={loading || page <= 1}
              onClick={() => loadInventory(page - 1, pageSize)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-gold/35 px-3 py-1 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
              disabled={loading || page >= totalPages}
              onClick={() => loadInventory(page + 1, pageSize)}
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
