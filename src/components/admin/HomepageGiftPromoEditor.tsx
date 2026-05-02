"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchHomepageGiftPromoEditorData,
  invalidateHomepageGiftPromoEditorCache,
} from "@/lib/adminHomepageGiftPromo";
import { apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";

type ProductSummary = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  stock?: number;
  isActive?: boolean;
};

type PromoState = {
  product: ProductSummary | null;
  discountPercent: number;
  isActive: boolean;
  sectionKicker: string;
  sectionDescription: string;
};

type CatalogProduct = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  stock: number;
};

export function HomepageGiftPromoEditor() {
  const [promo, setPromo] = useState<PromoState | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountInput, setDiscountInput] = useState("20");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");

  const load = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError("You need to be logged in.");
      setLoading(false);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { promo: p, products: prodList } = await fetchHomepageGiftPromoEditorData(token);
      setPromo({
        product: p.product ?? null,
        discountPercent: p.discountPercent ?? 20,
        isActive: p.isActive ?? false,
        sectionKicker: typeof p.sectionKicker === "string" ? p.sectionKicker : "",
        sectionDescription: typeof p.sectionDescription === "string" ? p.sectionDescription : "",
      });
      setSelectedProductId(p.product?._id ?? "");
      setDiscountInput(String(p.discountPercent ?? 20));
      setProducts(prodList);
    } catch {
      setError("Could not load homepage gift settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    const token = getAuthToken();
    if (!token || !promo) return;
    const discountPercent = Math.min(99, Math.max(1, Math.floor(Number(discountInput) || 0)));
    if (!Number.isFinite(discountPercent) || discountPercent < 1) {
      setToastTone("error");
      setToastMessage("Enter a discount between 1 and 99.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: {
        productId: string | null;
        discountPercent: number;
        isActive: boolean;
        sectionKicker: string;
        sectionDescription: string;
      } = {
        productId: selectedProductId || null,
        discountPercent,
        isActive: promo.isActive,
        sectionKicker: promo.sectionKicker,
        sectionDescription: promo.sectionDescription,
      };
      await apiPatchAuth("/api/admin/homepage-gift-promo", body, token);
      invalidateHomepageGiftPromoEditorCache();
      setToastTone("success");
      setToastMessage("Homepage gift promo saved.");
      await load();
    } catch {
      setToastTone("error");
      setToastMessage("Save failed. Check that a product is selected before turning the promo on.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !promo) {
    return (
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 text-sm text-muted">
        {error || "Loading homepage gift promo…"}
      </div>
    );
  }

  const selectedProd = products.find((p) => p._id === selectedProductId);
  const pctPreview = Math.min(99, Math.max(1, Math.floor(Number(discountInput) || promo.discountPercent)));
  const previewPrice =
    selectedProd && Number.isFinite(pctPreview) ? Math.round(selectedProd.priceKes * (1 - pctPreview / 100)) : null;

  return (
    <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
      {toastMessage ? <Toast message={toastMessage} tone={toastTone} onClose={() => setToastMessage("")} /> : null}
      <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Homepage — Our Gift For You</h2>
      <p className="mt-2 text-sm text-muted">
        Choose the product and discount shown in the storefront block. Checkout uses this discount automatically for
        that SKU. Edit the section label and description shown above the offer on the homepage.
      </p>

      <div className="mt-5 space-y-4">
        <label className="block text-xs text-muted">
          Section label (kicker)
          <input
            type="text"
            maxLength={120}
            className="mt-1 w-full rounded-lg border border-gold/25 bg-black/50 px-3 py-2 text-sm text-foreground"
            value={promo.sectionKicker}
            onChange={(e) => setPromo({ ...promo, sectionKicker: e.target.value })}
            placeholder="OUR GIFT FOR YOU (leave blank for default)"
          />
        </label>

        <label className="block text-xs text-muted">
          Section description
          <textarea
            rows={4}
            maxLength={2000}
            className="mt-1 w-full resize-y rounded-lg border border-gold/25 bg-black/50 px-3 py-2 text-sm text-foreground"
            value={promo.sectionDescription}
            onChange={(e) => setPromo({ ...promo, sectionDescription: e.target.value })}
            placeholder="Short paragraph under the product name (leave blank for default copy)"
          />
        </label>

        <label className="block text-xs text-muted">
          Product
          <select
            className="mt-1 w-full rounded-lg border border-gold/25 bg-black/50 px-3 py-2 text-sm text-foreground"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">— None —</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} · Ksh {p.priceKes.toLocaleString()} · stock {p.stock}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-muted">
          Discount (% off list price)
          <input
            type="number"
            min={1}
            max={99}
            className="mt-1 w-full rounded-lg border border-gold/25 bg-black/50 px-3 py-2 text-sm text-foreground"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={promo.isActive}
            onChange={(e) => setPromo({ ...promo, isActive: e.target.checked })}
          />
          Show on homepage (active)
        </label>

        {selectedProd && previewPrice !== null ? (
          <p className="text-xs text-muted">
            List price: Ksh {selectedProd.priceKes.toLocaleString()} → promo ~Ksh {previewPrice.toLocaleString()} (
            {pctPreview}% off)
          </p>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="button"
          className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save homepage gift"}
        </button>
      </div>
    </div>
  );
}
