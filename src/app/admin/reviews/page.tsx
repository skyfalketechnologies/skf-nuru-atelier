"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { apiDeleteAuth, apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Toast } from "@/components/admin/Toast";

type ReviewRow = {
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  productId: string;
  productName: string;
  productSlug: string;
};

function StarsCell({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-px text-base leading-none" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < rating ? "text-gold" : "text-white/12"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

function AdminReviewsContent() {
  const searchParams = useSearchParams();
  const productIdFilter = searchParams.get("productId")?.trim() || "";

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [confirmDelete, setConfirmDelete] = useState<{ productId: string; reviewId: string } | null>(null);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const prevDebouncedQuery = useRef(debouncedQuery);
  const prevProductFilter = useRef(productIdFilter);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  async function load(targetPage = page) {
    setLoading(true);
    setLoadError("");
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      setLoadError("You need to be logged in.");
      return;
    }
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("limit", String(pageSize));
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (productIdFilter) params.set("productId", productIdFilter);
    try {
      const data = await apiGetAuth<{
        reviews: ReviewRow[];
        pagination: { page: number; total: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean };
      }>(`/api/admin/reviews?${params.toString()}`, token);
      setReviews(data.reviews);
      setPage(data.pagination.page);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setLoadError("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const filtersChanged =
      prevDebouncedQuery.current !== debouncedQuery || prevProductFilter.current !== productIdFilter;
    prevDebouncedQuery.current = debouncedQuery;
    prevProductFilter.current = productIdFilter;
    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }
    void load(page);
  }, [debouncedQuery, productIdFilter, page, pageSize]);

  function openEdit(row: ReviewRow) {
    setEditing(row);
    setEditName(row.reviewerName);
    setEditRating(row.rating);
    setEditComment(row.comment);
  }

  async function saveEdit() {
    if (!editing) return;
    const token = getAuthToken();
    if (!token) return;
    setSavingEdit(true);
    try {
      await apiPatchAuth(
        `/api/admin/products/${editing.productId}/reviews/${editing.reviewId}`,
        { name: editName.trim(), rating: editRating, comment: editComment.trim() },
        token
      );
      setToastMessage("Review updated.");
      setToastTone("success");
      setEditing(null);
      await load(page);
    } catch {
      setToastMessage("Could not save changes.");
      setToastTone("error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmRemove() {
    if (!confirmDelete) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiDeleteAuth(
        `/api/admin/products/${confirmDelete.productId}/reviews/${confirmDelete.reviewId}`,
        token
      );
      setToastMessage("Review removed.");
      setToastTone("success");
      setConfirmDelete(null);
      const nextPage = reviews.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await load(nextPage);
    } catch {
      setToastMessage("Delete failed.");
      setToastTone("error");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground outline-none focus:border-gold/55";

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Moderation</p>
        <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Product reviews</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Search, edit, or remove customer reviews. Changes apply immediately on the storefront product page.
        </p>
        {productIdFilter ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sky-100">
              Filtered to one product
            </span>
            <Link href="/admin/reviews" className="text-gold underline decoration-gold/40 hover:decoration-gold">
              Clear filter
            </Link>
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-xs text-muted">
            Search reviews or products
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, comment, product…"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {loadError ? <p className="text-sm text-red-300">{loadError}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-gold/20">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 bg-black/40 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Reviewer</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Comment</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No reviews match your filters.
                  </td>
                </tr>
              ) : (
                reviews.map((row) => (
                  <tr key={`${row.productId}-${row.reviewId}`} className="border-b border-gold/10 transition hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted tabular-nums">{formatDate(row.createdAt)}</td>
                    <td className="max-w-[200px] px-4 py-3">
                      <Link
                        href={`/admin/products/${row.productId}/edit`}
                        className="font-medium text-foreground underline decoration-gold/30 underline-offset-2 hover:text-gold"
                      >
                        {row.productName}
                      </Link>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted/80">/shop/{row.productSlug}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{row.reviewerName}</td>
                    <td className="px-4 py-3">
                      <StarsCell rating={row.rating} />
                    </td>
                    <td className="max-w-md px-4 py-3 text-muted">
                      <p className="line-clamp-3">{row.comment}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="mr-2 rounded-lg border border-gold/35 px-2 py-1 text-xs text-gold hover:bg-gold/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ productId: row.productId, reviewId: row.reviewId })}
                        className="rounded-lg border border-red-400/35 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/10 bg-black/30 px-4 py-3 text-xs text-muted">
          <p>
            Page {page} of {totalPages} · {total} review{total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-gold/35 px-3 py-1.5 text-gold hover:bg-gold/10 disabled:opacity-40"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-gold/35 px-3 py-1.5 text-gold hover:bg-gold/10 disabled:opacity-40"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold/25 bg-[#0a0a0a] p-6 shadow-xl">
            <h2 className="font-serif text-xl text-gold">Edit review</h2>
            <p className="mt-1 text-xs text-muted">
              Product: <span className="text-foreground">{editing.productName}</span>
            </p>
            <label className="mt-4 block text-xs text-muted">
              Reviewer name
              <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <label className="mt-4 block text-xs text-muted">
              Rating
              <select
                className={inputClass}
                value={editRating}
                onChange={(e) => setEditRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-xs text-muted">
              Comment
              <textarea className={`${inputClass} min-h-[120px]`} value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={5} />
            </label>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingEdit}
                onClick={saveEdit}
                className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black hover:bg-gold/90 disabled:opacity-50"
              >
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-gold/40 px-5 py-2 text-sm text-gold hover:bg-gold/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete review"
        description="This permanently removes the review from the product. It cannot be recovered."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmRemove}
      />
      {toastMessage ? <Toast message={toastMessage} tone={toastTone} onClose={() => setToastMessage("")} /> : null}
    </section>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<section className="px-4 py-10 text-muted">Loading reviews…</section>}>
      <AdminReviewsContent />
    </Suspense>
  );
}
