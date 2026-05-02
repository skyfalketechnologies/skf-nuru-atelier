"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAdminTaxonomy } from "@/lib/adminTaxonomy";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type TaxonomyRef = { _id: string; name: string; slug: string };

type Product = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  compareAtPriceKes?: number;
  stock: number;
  description?: string;
  images?: string[];
  category?: TaxonomyRef | string;
  brand?: TaxonomyRef | string;
  audience?: "men" | "women" | "unisex";
  isFeatured?: boolean;
  isActive?: boolean;
};

function taxonomyId(ref: TaxonomyRef | string | undefined): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = useMemo(() => String(params?.id || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [brands, setBrands] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [priceKes, setPriceKes] = useState("");
  const [compareAtPriceKes, setCompareAtPriceKes] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [audience, setAudience] = useState<"men" | "women" | "unisex">("unisex");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");

  function notify(msg: string, tone: "info" | "success" | "error") {
    setMessage(msg);
    setToastTone(tone);
  }

  function plainTextFromHtml(html: string) {
    return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  }

  useEffect(() => {
    async function loadTaxonomy() {
      const token = getAuthToken();
      if (!token) return;
      try {
        const { categories: c, brands: b } = await fetchAdminTaxonomy(token);
        setCategories(c);
        setBrands(b);
      } catch {
        notify("Could not load categories or brands.", "error");
      }
    }
    loadTaxonomy();
  }, []);

  useEffect(() => {
    async function load() {
      const token = getAuthToken();
      if (!token || !productId) {
        setLoading(false);
        return;
      }
      try {
        const { product } = await apiGetAuth<{ product: Product }>(`/api/admin/products/${productId}`, token);
        if (!product) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setName(product.name);
        setSlug(product.slug);
        setPriceKes(String(product.priceKes));
        setCompareAtPriceKes(
          product.compareAtPriceKes !== undefined && product.compareAtPriceKes !== null
            ? String(product.compareAtPriceKes)
            : ""
        );
        setStock(String(product.stock));
        setCategoryId(taxonomyId(product.category));
        setBrandId(taxonomyId(product.brand));
        setAudience(product.audience || "unisex");
        setIsFeatured(Boolean(product.isFeatured));
        setIsActive(product.isActive !== false);
        setDescription(product.description || "");
        setImageUrls((product.images || []).join(", "));
        setNotFound(false);
      } catch {
        setNotFound(true);
        notify("Unable to load this product.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  async function save(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token || !productId) return;

    const priceNum = Number(priceKes);
    const stockNum = Number(stock);
    if (!name.trim() || name.trim().length < 2) {
      notify("Enter a product name (at least 2 characters).", "error");
      return;
    }
    if (!slug.trim() || slug.trim().length < 2) {
      notify("Enter a valid URL slug.", "error");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      notify("Enter a valid price in KES.", "error");
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      notify("Enter a valid stock quantity.", "error");
      return;
    }
    if (!categoryId || !brandId) {
      notify("Select a category and brand.", "error");
      return;
    }

    const images = imageUrls
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (images.length === 0) {
      notify("Add at least one image URL or upload a file.", "error");
      return;
    }

    const descPlain = plainTextFromHtml(description);
    if (descPlain.length < 4) {
      notify("Description must be at least 4 characters.", "error");
      return;
    }

    const compareNum = compareAtPriceKes.trim() === "" ? undefined : Number(compareAtPriceKes);
    if (compareNum !== undefined && (!Number.isFinite(compareNum) || compareNum < 0)) {
      notify("Compare-at price must be valid, or leave empty.", "error");
      return;
    }

    setSaving(true);
    try {
      await apiPatchAuth(
        `/api/admin/products/${productId}`,
        {
          name: name.trim(),
          slug: slug.trim(),
          priceKes: priceNum,
          ...(compareNum !== undefined ? { compareAtPriceKes: compareNum } : { compareAtPriceKes: null }),
          stock: stockNum,
          category: categoryId,
          brand: brandId,
          description,
          images,
          audience,
          isFeatured,
          isActive,
        },
        token
      );
      notify("Product updated.", "success");
      router.push("/admin/products");
    } catch {
      notify("Update failed. Check slug uniqueness and required fields.", "error");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted";

  if (notFound && !loading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-gold/25 bg-black/35 p-8 text-center">
          <h1 className="font-serif text-xl text-gold">Product not found</h1>
          <p className="mt-2 text-sm text-muted">This ID may be invalid or the product was removed.</p>
          <Link
            href="/admin/products"
            className="mt-6 inline-block rounded-full bg-gold px-5 py-2 text-sm text-black hover:opacity-90"
          >
            Back to products
          </Link>
        </div>
        {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Catalog</p>
          <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Edit product</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Updating the name does not change the slug automatically—adjust the slug only when you intend to change the
            public URL.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!loading && productId ? (
            <Link
              href={`/admin/reviews?productId=${encodeURIComponent(productId)}`}
              className="inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10"
            >
              Manage reviews
            </Link>
          ) : null}
          {!loading && slug ? (
            <Link
              href={`/shop/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10"
            >
              View on shop
            </Link>
          ) : null}
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10"
          >
            Back to products
          </Link>
        </div>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-lg bg-white/10" />
            <div className="h-10 animate-pulse rounded-lg bg-white/10" />
            <div className="h-32 animate-pulse rounded-lg bg-white/10" />
          </div>
        ) : (
          <>
            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-gold/80">Details</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="text-xs text-muted sm:col-span-2">
                      Product name
                      <input
                        className={inputClass}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </label>
                    <label className="text-xs text-muted sm:col-span-2">
                      URL slug
                      <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} required />
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted/90">
                        <span className="font-mono text-gold/80">/shop/{slug || "…"}</span>
                        <button
                          type="button"
                          className="text-gold underline decoration-gold/40 hover:decoration-gold"
                          onClick={() => setSlug(createSlug(name))}
                        >
                          Regenerate from name
                        </button>
                      </span>
                    </label>
                    <label className="text-xs text-muted">
                      Price (KES)
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        value={priceKes}
                        onChange={(e) => setPriceKes(e.target.value)}
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Compare-at (KES)
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        placeholder="Optional"
                        value={compareAtPriceKes}
                        onChange={(e) => setCompareAtPriceKes(e.target.value)}
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Stock
                      <input
                        className={inputClass}
                        inputMode="numeric"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Audience
                      <select
                        className={inputClass}
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as typeof audience)}
                      >
                        <option value="unisex">Unisex</option>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                      </select>
                    </label>
                    <label className="text-xs text-muted">
                      Category
                      <select
                        className={inputClass}
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-muted">
                      Brand
                      <select className={inputClass} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand._id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                        <input
                          type="checkbox"
                          className="rounded border-gold/40 bg-black/35 text-gold focus:ring-gold/50"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        Featured
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                        <input
                          type="checkbox"
                          className="rounded border-gold/40 bg-black/35 text-gold focus:ring-gold/50"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        Active listing
                      </label>
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Update notes, highlights, and selling points…"
                />
              </div>

              <div className="space-y-4 rounded-xl border border-gold/20 bg-black/25 p-4 sm:p-5">
                <ProductImageUploader
                  imageUrls={imageUrls}
                  onImageUrlsChange={setImageUrls}
                  disabled={saving}
                  onToast={notify}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gold/15 pt-6">
              <button
                type="submit"
                className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <Link
                href="/admin/products"
                className="rounded-full border border-gold/35 px-5 py-2.5 text-sm text-gold hover:bg-gold/10"
              >
                Cancel
              </Link>
            </div>
          </>
        )}
      </form>

      <TaxonomyManager
        onTaxonomyUpdated={async () => {
          const token = getAuthToken();
          if (!token) return;
          try {
            const { categories: c, brands: b } = await fetchAdminTaxonomy(token);
            setCategories(c);
            setBrands(b);
          } catch {
            notify("Could not refresh categories or brands.", "error");
          }
        }}
      />

      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
