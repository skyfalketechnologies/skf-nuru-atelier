"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDeleteAuth, apiGetAuth, apiPatchAuth, apiPostAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type NamedEntity = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type GiftOption = {
  _id: string;
  name: string;
  code: string;
  extraCostKes: number;
  isActive: boolean;
};

export default function AdminCatalogPage() {
  const [categories, setCategories] = useState<NamedEntity[]>([]);
  const [brands, setBrands] = useState<NamedEntity[]>([]);
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([]);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ path: string; id: string } | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [giftName, setGiftName] = useState("");
  const [giftCode, setGiftCode] = useState("luxury_box");
  const [giftCost, setGiftCost] = useState("0");
  const [editingEntityId, setEditingEntityId] = useState("");
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editGiftCost, setEditGiftCost] = useState("0");

  async function loadData() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      return;
    }

    try {
      const [categoriesData, brandsData, giftData] = await Promise.all([
        apiGetAuth<{ categories: NamedEntity[] }>("/api/admin/categories", token),
        apiGetAuth<{ brands: NamedEntity[] }>("/api/admin/brands", token),
        apiGetAuth<{ giftOptions: GiftOption[] }>("/api/admin/gift-options", token),
      ]);
      setCategories(categoriesData.categories);
      setBrands(brandsData.brands);
      setGiftOptions(giftData.giftOptions);
    } catch {
      setMessage("Unable to load admin catalog data.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createCategory(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;
    await apiPostAuth("/api/admin/categories", { name: categoryName, slug: categorySlug }, token);
    setCategoryName("");
    setCategorySlug("");
    await loadData();
    setMessage("Category created.");
    setToastTone("success");
  }

  async function createBrand(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;
    await apiPostAuth("/api/admin/brands", { name: brandName, slug: brandSlug }, token);
    setBrandName("");
    setBrandSlug("");
    await loadData();
    setMessage("Brand created.");
    setToastTone("success");
  }

  async function createGiftOption(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;
    await apiPostAuth(
      "/api/admin/gift-options",
      { name: giftName, code: giftCode, extraCostKes: Number(giftCost) },
      token
    );
    setGiftName("");
    setGiftCost("0");
    await loadData();
    setMessage("Gift option created.");
    setToastTone("success");
  }

  async function toggleEntity(path: string, id: string, current: boolean) {
    const token = getAuthToken();
    if (!token) return;
    await apiPatchAuth(`${path}/${id}`, { isActive: !current }, token);
    await loadData();
    setMessage("Status updated.");
    setToastTone("success");
  }

  async function deleteEntity(path: string, id: string) {
    const token = getAuthToken();
    if (!token) return;
    await apiDeleteAuth(`${path}/${id}`, token);
    await loadData();
    setMessage("Item deleted.");
    setToastTone("success");
  }

  async function saveNamedEntity(path: string, id: string) {
    const token = getAuthToken();
    if (!token) return;
    await apiPatchAuth(`${path}/${id}`, { name: editName, slug: editSlug }, token);
    setEditingEntityId("");
    await loadData();
    setMessage("Item updated.");
    setToastTone("success");
  }

  async function saveGiftEntity(id: string) {
    const token = getAuthToken();
    if (!token) return;
    await apiPatchAuth(`/api/admin/gift-options/${id}`, { name: editName, extraCostKes: Number(editGiftCost) }, token);
    setEditingEntityId("");
    await loadData();
    setMessage("Gift option updated.");
    setToastTone("success");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-serif text-2xl text-gold sm:text-3xl">Catalog Management</h1>
      {message && !loading ? (
        <div className="mt-2 flex items-center gap-3 text-sm text-muted">
          <span>{message}</span>
          <button
            className="text-gold underline"
            onClick={() => {
              void loadData();
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {loading ? <div className="h-24 animate-pulse rounded border border-gold/20 bg-white/5 lg:col-span-3" /> : null}
        <div className="luxury-card rounded-xl p-4">
          <h2 className="text-sm text-gold">Categories</h2>
          <form onSubmit={createCategory} className="mt-3 grid gap-2">
            <input className="rounded border border-gold/40 bg-black p-2" placeholder="Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            <input className="rounded border border-gold/40 bg-black p-2" placeholder="Slug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} />
            <button className="rounded bg-gold px-4 py-2 text-sm text-black">Add Category</button>
          </form>
          <div className="mt-4 space-y-2 text-sm">
            {categories.map((item) => (
              <div key={item._id} className="rounded border border-gold/30 p-2">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => toggleEntity("/api/admin/categories", item._id, item.isActive)}
                >
                  <span>{item.name}</span>
                  <span className={item.isActive ? "text-emerald-300" : "text-red-300"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
                <button className="mt-2 text-xs text-red-300 underline" onClick={() => setConfirmDelete({ path: "/api/admin/categories", id: item._id })}>
                  Delete
                </button>
                <button
                  className="mt-2 ml-3 text-xs text-gold underline"
                  onClick={() => {
                    setEditingEntityId(item._id);
                    setEditName(item.name);
                    setEditSlug(item.slug);
                  }}
                >
                  Edit
                </button>
                {editingEntityId === item._id ? (
                  <div className="mt-2 grid gap-2">
                    <input className="rounded border border-gold/40 bg-black p-1 text-xs" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input className="rounded border border-gold/40 bg-black p-1 text-xs" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                    <button className="rounded bg-gold px-2 py-1 text-xs text-black" onClick={() => saveNamedEntity("/api/admin/categories", item._id)}>
                      Save
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card rounded-xl p-4">
          <h2 className="text-sm text-gold">Brands</h2>
          <form onSubmit={createBrand} className="mt-3 grid gap-2">
            <input className="rounded border border-gold/40 bg-black p-2" placeholder="Name" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            <input className="rounded border border-gold/40 bg-black p-2" placeholder="Slug" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} />
            <button className="rounded bg-gold px-4 py-2 text-sm text-black">Add Brand</button>
          </form>
          <div className="mt-4 space-y-2 text-sm">
            {brands.map((item) => (
              <div key={item._id} className="rounded border border-gold/30 p-2">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => toggleEntity("/api/admin/brands", item._id, item.isActive)}
                >
                  <span>{item.name}</span>
                  <span className={item.isActive ? "text-emerald-300" : "text-red-300"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
                <button className="mt-2 text-xs text-red-300 underline" onClick={() => setConfirmDelete({ path: "/api/admin/brands", id: item._id })}>
                  Delete
                </button>
                <button
                  className="mt-2 ml-3 text-xs text-gold underline"
                  onClick={() => {
                    setEditingEntityId(item._id);
                    setEditName(item.name);
                    setEditSlug(item.slug);
                  }}
                >
                  Edit
                </button>
                {editingEntityId === item._id ? (
                  <div className="mt-2 grid gap-2">
                    <input className="rounded border border-gold/40 bg-black p-1 text-xs" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input className="rounded border border-gold/40 bg-black p-1 text-xs" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                    <button className="rounded bg-gold px-2 py-1 text-xs text-black" onClick={() => saveNamedEntity("/api/admin/brands", item._id)}>
                      Save
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card rounded-xl p-4">
          <h2 className="text-sm text-gold">Gift Options</h2>
          <form onSubmit={createGiftOption} className="mt-3 grid gap-2">
            <input className="rounded border border-gold/40 bg-black p-2" placeholder="Name" value={giftName} onChange={(e) => setGiftName(e.target.value)} />
            <select className="rounded border border-gold/40 bg-black p-2" value={giftCode} onChange={(e) => setGiftCode(e.target.value)}>
              <option value="luxury_box">Luxury Box</option>
              <option value="ribbon_wrap">Ribbon Wrap</option>
              <option value="signature_wrap">Signature Wrap</option>
            </select>
            <input className="rounded border border-gold/40 bg-black p-2" placeholder="Extra Cost (KES)" value={giftCost} onChange={(e) => setGiftCost(e.target.value)} />
            <button className="rounded bg-gold px-4 py-2 text-sm text-black">Add Gift Option</button>
          </form>
          <div className="mt-4 space-y-2 text-sm">
            {giftOptions.map((item) => (
              <div key={item._id} className="rounded border border-gold/30 p-2">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => toggleEntity("/api/admin/gift-options", item._id, item.isActive)}
                >
                  <span>
                    {item.name} (Ksh {item.extraCostKes.toLocaleString()})
                  </span>
                  <span className={item.isActive ? "text-emerald-300" : "text-red-300"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
                <button className="mt-2 text-xs text-red-300 underline" onClick={() => setConfirmDelete({ path: "/api/admin/gift-options", id: item._id })}>
                  Delete
                </button>
                <button
                  className="mt-2 ml-3 text-xs text-gold underline"
                  onClick={() => {
                    setEditingEntityId(item._id);
                    setEditName(item.name);
                    setEditGiftCost(String(item.extraCostKes));
                  }}
                >
                  Edit
                </button>
                {editingEntityId === item._id ? (
                  <div className="mt-2 grid gap-2">
                    <input className="rounded border border-gold/40 bg-black p-1 text-xs" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input className="rounded border border-gold/40 bg-black p-1 text-xs" value={editGiftCost} onChange={(e) => setEditGiftCost(e.target.value)} />
                    <button className="rounded bg-gold px-2 py-1 text-xs text-black" onClick={() => saveGiftEntity(item._id)}>
                      Save
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Item"
        description="This action cannot be undone. Are you sure you want to delete this item?"
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteEntity(confirmDelete.path, confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}

