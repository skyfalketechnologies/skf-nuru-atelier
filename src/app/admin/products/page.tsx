"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDeleteAuth, apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type TaxonomyRef = { _id: string; name: string; slug: string };

type Product = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  stock: number;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  audience?: string;
  createdAt?: string;
  category?: TaxonomyRef | string;
  brand?: TaxonomyRef | string;
};

type SortKey = "newest" | "name" | "price" | "stock";
type StockFilter = "all" | "low" | "out";

function refLabel(ref: TaxonomyRef | string | undefined): string {
  if (!ref) return "—";
  return typeof ref === "string" ? "—" : ref.name;
}

function stockTone(stock: number): "ok" | "low" | "out" {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "ok";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  async function loadProducts(targetPage = page, targetPageSize = pageSize) {
    setLoading(true);
    setLoadError("");
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      setLoadError("You need to be logged in to manage products.");
      return;
    }
    try {
      const data = await apiGetAuth<{
        products: Product[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
        summary?: { catalogTotal: number; lowStockCount: number; outOfStockCount: number };
      }>(
        `/api/admin/products?page=${targetPage}&limit=${targetPageSize}&q=${encodeURIComponent(
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
      setLowStockCount(data.summary?.lowStockCount ?? 0);
      setOutOfStockCount(data.summary?.outOfStockCount ?? 0);
    } catch {
      setLoadError("Could not load products. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    loadProducts(1, pageSize);
  }, [debouncedQuery, stockFilter, sortKey]);

  async function removeProduct(productId: string) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiDeleteAuth(`/api/admin/products/${productId}`, token);
      setToastMessage("Product deleted.");
      setToastTone("success");
      const nextPage = products.length === 1 && page > 1 ? page - 1 : page;
      await loadProducts(nextPage, pageSize);
    } catch {
      setToastMessage("Delete failed. Try again.");
      setToastTone("error");
    }
  }

  const selectClass =
    "rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-xs text-foreground sm:text-sm";

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Product control</p>
        <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Products</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Search, sort, and maintain catalog items. Low-stock and inactive items are easy to spot at a glance.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Total</p>
            <p className="mt-1 text-2xl font-medium text-gold tabular-nums">{catalogTotal}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Low stock (1–5)</p>
            <p className="mt-1 text-2xl font-medium text-amber-200/90 tabular-nums">{lowStockCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Out of stock</p>
            <p className="mt-1 text-2xl font-medium text-red-300/90 tabular-nums">{outOfStockCount}</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-black/25 p-4 text-sm">
            <p className="text-muted">Matching filters</p>
            <p className="mt-1 text-2xl font-medium text-gold tabular-nums">{totalProducts}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-black hover:opacity-90"
          >
            Add product
          </Link>
          <button
            type="button"
            onClick={loadProducts}
            className="rounded-full border border-gold/35 px-5 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-red-400/35 bg-red-950/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm text-red-200/95">{loadError}</p>
          <button
            type="button"
            className="shrink-0 rounded-full border border-red-300/50 px-4 py-2 text-sm text-red-100 hover:bg-red-500/10"
            onClick={loadProducts}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Inventory</h2>
            <p className="mt-1 text-xs text-muted">Thumbnail, taxonomy, and quick actions</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              className="w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted sm:min-w-[220px] sm:flex-1 lg:max-w-xs"
              placeholder="Search name, slug, category, brand…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <select
              className={selectClass}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              aria-label="Filter by stock"
            >
              <option value="all">All stock levels</option>
              <option value="low">Low only (1–5)</option>
              <option value="out">Out of stock</option>
            </select>
            <select
              className={selectClass}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort products"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="price">Price (low → high)</option>
              <option value="stock">Stock (low → high)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gold/15">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-black/20 text-left text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="hidden px-3 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-3 py-3 font-medium lg:table-cell">Brand</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="hidden px-3 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gold/10">
                    <td className="px-3 py-3" colSpan={7}>
                      <div className="h-12 w-full animate-pulse rounded-lg bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-muted" colSpan={7}>
                    {products.length === 0
                      ? "No products yet. Add your first item to populate the shop."
                      : "No products match your search or filters."}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const thumb = product.images?.[0];
                  const st = stockTone(product.stock);
                  return (
                    <tr key={product._id} className="border-b border-gold/10 transition-colors hover:bg-white/[0.03]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/20 bg-black/40">
                            {thumb ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={thumb} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                                No img
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">{product.name}</span>
                              {product.isFeatured ? (
                                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                                  Featured
                                </span>
                              ) : null}
                            </div>
                            <p className="truncate font-mono text-xs text-muted">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-muted md:table-cell">{refLabel(product.category)}</td>
                      <td className="hidden px-3 py-3 text-muted lg:table-cell">{refLabel(product.brand)}</td>
                      <td className="px-3 py-3 tabular-nums text-foreground">
                        Ksh {product.priceKes.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                            st === "out"
                              ? "bg-red-500/15 text-red-200"
                              : st === "low"
                                ? "bg-amber-500/15 text-amber-100"
                                : "bg-emerald-500/10 text-emerald-100"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell">
                        {product.isActive === false ? (
                          <span className="text-xs text-red-300/90">Hidden</span>
                        ) : (
                          <span className="text-xs text-emerald-200/80">Live</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/shop/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-gold/30 px-2.5 py-1 text-xs text-gold hover:bg-gold/10"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="rounded-lg border border-gold/40 px-2.5 py-1 text-xs text-gold hover:bg-gold/10"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="rounded-lg border border-red-400/60 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10"
                            onClick={() => setConfirmDeleteProductId(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-gold/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Page {page} of {totalPages} · Showing {products.length} of {totalProducts} products
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted">
              Per page
              <select
                className={selectClass}
                value={pageSize}
                onChange={(e) => loadProducts(1, Number(e.target.value))}
                aria-label="Products per page"
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
              onClick={() => loadProducts(page - 1, pageSize)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-gold/35 px-3 py-1.5 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
              disabled={loading || page >= totalPages}
              onClick={() => loadProducts(page + 1, pageSize)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteProductId)}
        title="Delete product"
        description="This permanently removes the product from the catalog. Orders that already reference it are unaffected, but the listing will disappear from the shop."
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteProductId("")}
        onConfirm={async () => {
          await removeProduct(confirmDeleteProductId);
          setConfirmDeleteProductId("");
        }}
      />
      {toastMessage ? (
        <Toast message={toastMessage} tone={toastTone} onClose={() => setToastMessage("")} />
      ) : null}
    </section>
  );
}
