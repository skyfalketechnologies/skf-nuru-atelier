"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetAuth, apiPostAuth } from "@/lib/api";
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

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [brands, setBrands] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [priceKes, setPriceKes] = useState("0");
  const [compareAtPriceKes, setCompareAtPriceKes] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [audience, setAudience] = useState<"men" | "women" | "unisex">("unisex");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [saving, setSaving] = useState(false);
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
        const [categoriesData, brandsData] = await Promise.all([
          apiGetAuth<{ categories: Array<{ _id: string; name: string; slug: string }> }>(
            "/api/admin/categories",
            token
          ),
          apiGetAuth<{ brands: Array<{ _id: string; name: string; slug: string }> }>("/api/admin/brands", token),
        ]);
        setCategories(categoriesData.categories);
        setBrands(brandsData.brands);
        if (categoriesData.categories.length > 0) {
          setCategoryId(categoriesData.categories[0]._id);
        }
        if (brandsData.brands.length > 0) {
          setBrandId(brandsData.brands[0]._id);
        }
      } catch {
        notify("Could not load categories or brands.", "error");
      }
    }
    loadTaxonomy();
  }, []);

  function handleNameChange(nextName: string) {
    setName(nextName);
    if (!slugTouched) setSlug(createSlug(nextName));
  }

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      notify("Login required.", "error");
      return;
    }
    const priceNum = Number(priceKes);
    const stockNum = Number(stock);
    if (!name.trim() || name.trim().length < 2) {
      notify("Enter a product name (at least 2 characters).", "error");
      return;
    }
    if (!slug.trim() || slug.trim().length < 2) {
      notify("Enter a valid URL slug (at least 2 characters).", "error");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      notify("Enter a valid price in KES.", "error");
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      notify("Enter a valid stock quantity (whole number).", "error");
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
    const normalizedDescription = plainTextFromHtml(description).length
      ? description
      : `<p>${name.trim()} — product description.</p>`;

    const compareNum = compareAtPriceKes.trim() === "" ? undefined : Number(compareAtPriceKes);
    if (compareNum !== undefined && (!Number.isFinite(compareNum) || compareNum < 0)) {
      notify("Compare-at price must be a valid number, or leave it empty.", "error");
      return;
    }

    setSaving(true);
    try {
      await apiPostAuth(
        "/api/admin/products",
        {
          name: name.trim(),
          slug: slug.trim(),
          description: normalizedDescription,
          category: categoryId,
          brand: brandId,
          images: images.length
            ? images
            : ["https://images.unsplash.com/photo-1541643600914-78b084683601"],
          priceKes: priceNum,
          ...(compareNum !== undefined ? { compareAtPriceKes: compareNum } : {}),
          stock: stockNum,
          audience,
          isFeatured,
          isActive,
        },
        token
      );
      notify("Product created.", "success");
      router.push("/admin/products");
    } catch {
      notify("Creation failed. Check slug uniqueness, category, and brand.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function checkImageKit() {
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiGetAuth("/api/admin/imagekit/auth", token);
      notify("ImageKit auth endpoint is configured and reachable.", "success");
    } catch {
      notify("ImageKit is not configured yet. Add IMAGEKIT keys in backend env.", "error");
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted";

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Catalog</p>
          <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Add product</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Create a storefront listing with pricing, taxonomy, and images. The first image becomes the shop thumbnail.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10"
        >
          Back to products
        </Link>
      </div>

      <form onSubmit={createProduct} className="rounded-2xl border border-gold/25 bg-black/35 p-5 sm:p-6">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-gold/80">Details</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="text-xs text-muted sm:col-span-2">
                  Product name
                  <input
                    className={inputClass}
                    placeholder="e.g. Noir Eau de Parfum"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </label>
                <label className="text-xs text-muted sm:col-span-2">
                  URL slug
                  <input
                    className={inputClass}
                    placeholder="noir-eau-de-parfum"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                  />
                  <span className="mt-1 block text-[11px] text-muted/90">
                    Used in <span className="font-mono text-gold/80">/shop/your-slug</span>. Edit manually if needed;
                    it is not auto-changed after you type here.
                  </span>
                </label>
                <label className="text-xs text-muted">
                  Price (KES)
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    placeholder="0"
                    value={priceKes}
                    onChange={(e) => setPriceKes(e.target.value)}
                  />
                </label>
                <label className="text-xs text-muted">
                  Compare-at (KES)
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    placeholder="(Optional) was price"
                    value={compareAtPriceKes}
                    onChange={(e) => setCompareAtPriceKes(e.target.value)}
                  />
                </label>
                <label className="text-xs text-muted">
                  Stock
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="0"
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
                    {categories.length === 0 ? (
                      <option value="">No categories yet</option>
                    ) : null}
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
                    {brands.length === 0 ? <option value="">No brands yet</option> : null}
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
                    Featured on shop highlights
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      className="rounded border-gold/40 bg-black/35 text-gold focus:ring-gold/50"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Active (visible when published)
                  </label>
                </div>
              </div>
            </div>

            <RichTextEditor
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Notes, profile, usage, and selling points…"
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
            {saving ? "Creating…" : "Create product"}
          </button>
          <button
            type="button"
            className="rounded-full border border-gold/35 px-5 py-2 text-sm text-gold hover:bg-gold/10"
            onClick={checkImageKit}
          >
            Test ImageKit
          </button>
        </div>
      </form>

      <TaxonomyManager
        onTaxonomyUpdated={async () => {
          const token = getAuthToken();
          if (!token) return;
          try {
            const [categoriesData, brandsData] = await Promise.all([
              apiGetAuth<{ categories: Array<{ _id: string; name: string; slug: string }> }>(
                "/api/admin/categories",
                token
              ),
              apiGetAuth<{ brands: Array<{ _id: string; name: string; slug: string }> }>("/api/admin/brands", token),
            ]);
            setCategories(categoriesData.categories);
            setBrands(brandsData.brands);
            if (!categoryId && categoriesData.categories[0]?._id) {
              setCategoryId(categoriesData.categories[0]._id);
            }
            if (!brandId && brandsData.brands[0]?._id) {
              setBrandId(brandsData.brands[0]._id);
            }
          } catch {
            notify("Could not refresh categories or brands.", "error");
          }
        }}
      />

      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
