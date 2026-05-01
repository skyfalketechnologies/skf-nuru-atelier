"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiDeleteAuth, apiGetAuth, apiPatchAuth, apiPostAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Variant = { key: string; label: string; priceKes: number; sortOrder: number };

type Category = {
  _id: string;
  audience: "for_her" | "for_him";
  section: "curated" | "body_care";
  key: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  variants: Variant[];
};

const emptyVariant = (): Variant => ({ key: "", label: "", priceKes: 0, sortOrder: 0 });

export default function AdminGiftCustomizationPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [audience, setAudience] = useState<"for_her" | "for_him">("for_her");
  const [section, setSection] = useState<"curated" | "body_care">("curated");
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

  const load = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGetAuth<{ categories: Category[] }>("/api/admin/gift-customization/categories", token);
      setCategories(data.categories);
      setMessage("");
    } catch {
      setMessage("Could not load gift customization categories.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setAudience("for_her");
    setSection("curated");
    setKey("");
    setName("");
    setDescription("");
    setSortOrder("0");
    setIsActive(true);
    setVariants([emptyVariant()]);
  }

  function startEdit(cat: Category) {
    setEditingId(cat._id);
    setAudience(cat.audience);
    setSection(cat.section);
    setKey(cat.key);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setSortOrder(String(cat.sortOrder ?? 0));
    setIsActive(cat.isActive);
    setVariants(cat.variants.length ? cat.variants.map((v) => ({ ...v })) : [emptyVariant()]);
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, { ...emptyVariant(), sortOrder: prev.length }]);
  }

  function updateVariant(index: number, patch: Partial<Variant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    const cleanedVariants = variants
      .map((v, i) => ({
        key: v.key.trim(),
        label: v.label.trim(),
        priceKes: Math.max(0, Number(v.priceKes) || 0),
        sortOrder: Number.isFinite(v.sortOrder) ? v.sortOrder : i,
      }))
      .filter((v) => v.key && v.label);

    if (!cleanedVariants.length) {
      setMessage("Add at least one variant with key and label.");
      setToastTone("error");
      return;
    }

    const body = {
      audience,
      section,
      key: key.trim(),
      name: name.trim(),
      description: description.trim(),
      sortOrder: Math.floor(Number(sortOrder) || 0),
      isActive,
      variants: cleanedVariants,
    };

    if (!body.key || !body.name) {
      setMessage("Category key and name are required.");
      setToastTone("error");
      return;
    }

    try {
      if (editingId) {
        await apiPatchAuth(`/api/admin/gift-customization/categories/${editingId}`, body, token);
        setMessage("Category updated.");
      } else {
        await apiPostAuth("/api/admin/gift-customization/categories", body, token);
        setMessage("Category created.");
      }
      setToastTone("success");
      resetForm();
      await load();
    } catch {
      setMessage("Save failed. Keys must be unique per audience + section (e.g. bouquet).");
      setToastTone("error");
    }
  }

  async function toggleActive(cat: Category) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiPatchAuth(`/api/admin/gift-customization/categories/${cat._id}`, { isActive: !cat.isActive }, token);
      setMessage("Status updated.");
      setToastTone("success");
      await load();
    } catch {
      setMessage("Could not update status.");
      setToastTone("error");
    }
  }

  async function removeCategory(id: string) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiDeleteAuth(`/api/admin/gift-customization/categories/${id}`, token);
      setMessage("Category deleted.");
      setToastTone("success");
      if (editingId === id) resetForm();
      await load();
    } catch {
      setMessage("Delete failed.");
      setToastTone("error");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Gift Atelier</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Customization options</h1>
        <p className="mt-2 text-sm text-muted">
          Manage curated gift categories and body care / accessory groups for &ldquo;For Her&rdquo; and &ldquo;For
          Him&rdquo;. Keys should stay stable (they appear in cart line IDs). Packaging styles stay under{" "}
          <span className="text-gold">Catalog → Gift Options</span>.
        </p>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl border border-gold/20 bg-white/5" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="luxury-card rounded-xl p-4">
            <h2 className="text-sm text-gold">Existing categories</h2>
            <div className="mt-3 max-h-[480px] space-y-2 overflow-y-auto text-sm">
              {categories.length === 0 ? (
                <p className="text-muted">No categories yet. Run backend seed or create one on the right.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat._id} className="rounded border border-gold/25 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted">
                          {cat.audience === "for_her" ? "For her" : "For him"} ·{" "}
                          {cat.section === "curated" ? "Curated gifts" : "Body care / accessories"} · key{" "}
                          <code className="text-gold">{cat.key}</code>
                        </p>
                        <p className="text-xs text-muted">{cat.variants.length} variant(s)</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          className={cat.isActive ? "text-xs text-emerald-300" : "text-xs text-red-300"}
                          onClick={() => void toggleActive(cat)}
                        >
                          {cat.isActive ? "Active" : "Inactive"} — toggle
                        </button>
                        <button type="button" className="text-xs text-gold underline" onClick={() => startEdit(cat)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs text-red-300 underline"
                          onClick={() => setConfirmDeleteId(cat._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form className="luxury-card space-y-4 rounded-xl p-4" onSubmit={onSubmit}>
            <h2 className="text-sm text-gold">{editingId ? "Edit category" : "New category"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted">
                Audience
                <select
                  className="mt-1 w-full rounded border border-gold/40 bg-black p-2 text-sm"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as "for_her" | "for_him")}
                  disabled={Boolean(editingId)}
                >
                  <option value="for_her">For her</option>
                  <option value="for_him">For him</option>
                </select>
              </label>
              <label className="text-xs text-muted">
                Section
                <select
                  className="mt-1 w-full rounded border border-gold/40 bg-black p-2 text-sm"
                  value={section}
                  onChange={(e) => setSection(e.target.value as "curated" | "body_care")}
                  disabled={Boolean(editingId)}
                >
                  <option value="curated">Curated gifts (CHOOSE GIFTS)</option>
                  <option value="body_care">Body care / accessories</option>
                </select>
              </label>
            </div>
            <label className="block text-xs text-muted">
              Stable key (slug, e.g. bouquet)
              <input
                className="mt-1 w-full rounded border border-gold/40 bg-black p-2 text-sm"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={Boolean(editingId)}
                placeholder="bouquet"
              />
            </label>
            <label className="block text-xs text-muted">
              Display name
              <input
                className="mt-1 w-full rounded border border-gold/40 bg-black p-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Flower Bouquet"
              />
            </label>
            <label className="block text-xs text-muted">
              Description (curated section only)
              <textarea
                className="mt-1 w-full rounded border border-gold/40 bg-black p-2 text-sm"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted">
                Sort order
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-gold/40 bg-black p-2 text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </label>
              <label className="mt-6 flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active on storefront
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gold">Variants</p>
                <button type="button" className="text-xs text-gold underline" onClick={addVariantRow}>
                  Add row
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="grid gap-2 rounded border border-gold/20 p-2 sm:grid-cols-[1fr_1.2fr_100px_80px_auto] sm:items-end">
                    <label className="text-xs text-muted">
                      Key
                      <input
                        className="mt-1 w-full rounded border border-gold/40 bg-black p-1 text-xs"
                        value={v.key}
                        onChange={(e) => updateVariant(i, { key: e.target.value })}
                        placeholder="bouquet-classic"
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Label
                      <input
                        className="mt-1 w-full rounded border border-gold/40 bg-black p-1 text-xs"
                        value={v.label}
                        onChange={(e) => updateVariant(i, { label: e.target.value })}
                        placeholder="Classic Bouquet"
                      />
                    </label>
                    <label className="text-xs text-muted">
                      KES
                      <input
                        type="number"
                        className="mt-1 w-full rounded border border-gold/40 bg-black p-1 text-xs"
                        value={v.priceKes}
                        onChange={(e) => updateVariant(i, { priceKes: Number(e.target.value) })}
                        min={0}
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Order
                      <input
                        type="number"
                        className="mt-1 w-full rounded border border-gold/40 bg-black p-1 text-xs"
                        value={v.sortOrder}
                        onChange={(e) => updateVariant(i, { sortOrder: Number(e.target.value) })}
                      />
                    </label>
                    <button type="button" className="text-xs text-red-300 underline sm:mb-2" onClick={() => removeVariant(i)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black">
                {editingId ? "Save changes" : "Create category"}
              </button>
              {editingId ? (
                <button type="button" className="rounded-full border border-gold/40 px-5 py-2 text-sm text-gold" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete category"
        description="This removes the category from the Gift Atelier builder. Continue?"
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) void removeCategory(confirmDeleteId);
        }}
      />
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
