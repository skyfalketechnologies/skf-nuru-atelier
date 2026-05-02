"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiPatchAuth, apiPostAuth } from "@/lib/api";
import { fetchAdminTaxonomy, invalidateAdminTaxonomyCache, type AdminTaxonomyItem } from "@/lib/adminTaxonomy";
import { getAuthToken } from "@/lib/auth";

type TaxonomyManagerProps = {
  onTaxonomyUpdated?: () => void;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function TaxonomyManager({ onTaxonomyUpdated }: TaxonomyManagerProps) {
  const [categories, setCategories] = useState<AdminTaxonomyItem[]>([]);
  const [brands, setBrands] = useState<AdminTaxonomyItem[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingBrandId, setEditingBrandId] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editBrandName, setEditBrandName] = useState("");
  const [status, setStatus] = useState("");

  async function loadTaxonomy() {
    const token = getAuthToken();
    if (!token) return;
    try {
      const { categories: nextCategories, brands: nextBrands } = await fetchAdminTaxonomy(token);
      setCategories(nextCategories);
      setBrands(nextBrands);
      onTaxonomyUpdated?.();
    } catch {
      setStatus("Could not load categories/brands.");
    }
  }

  useEffect(() => {
    loadTaxonomy();
  }, []);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token || !categoryName.trim()) return;
    try {
      await apiPostAuth(
        "/api/admin/categories",
        { name: categoryName.trim(), slug: createSlug(categoryName) },
        token
      );
      setCategoryName("");
      setStatus("Category added.");
      invalidateAdminTaxonomyCache();
      await loadTaxonomy();
    } catch {
      setStatus("Failed to add category.");
    }
  }

  async function addBrand(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token || !brandName.trim()) return;
    try {
      await apiPostAuth(
        "/api/admin/brands",
        { name: brandName.trim(), slug: createSlug(brandName) },
        token
      );
      setBrandName("");
      setStatus("Brand added.");
      invalidateAdminTaxonomyCache();
      await loadTaxonomy();
    } catch {
      setStatus("Failed to add brand.");
    }
  }

  async function saveCategoryEdit() {
    const token = getAuthToken();
    if (!token || !editingCategoryId || !editCategoryName.trim()) return;
    try {
      await apiPatchAuth(
        `/api/admin/categories/${editingCategoryId}`,
        { name: editCategoryName.trim(), slug: createSlug(editCategoryName) },
        token
      );
      setEditingCategoryId("");
      setEditCategoryName("");
      setStatus("Category updated.");
      invalidateAdminTaxonomyCache();
      await loadTaxonomy();
    } catch {
      setStatus("Failed to update category.");
    }
  }

  async function saveBrandEdit() {
    const token = getAuthToken();
    if (!token || !editingBrandId || !editBrandName.trim()) return;
    try {
      await apiPatchAuth(
        `/api/admin/brands/${editingBrandId}`,
        { name: editBrandName.trim(), slug: createSlug(editBrandName) },
        token
      );
      setEditingBrandId("");
      setEditBrandName("");
      setStatus("Brand updated.");
      invalidateAdminTaxonomyCache();
      await loadTaxonomy();
    } catch {
      setStatus("Failed to update brand.");
    }
  }

  return (
    <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
      <h3 className="text-sm uppercase tracking-[0.14em] text-gold/80">Manage Categories & Brands</h3>
      {status ? <p className="mt-2 text-xs text-muted">{status}</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Categories</p>
          <form onSubmit={addCategory} className="mt-2 flex gap-2">
            <input
              className="w-full rounded border border-gold/35 bg-black/35 p-2 text-sm"
              placeholder="New category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button className="rounded border border-gold/35 px-3 text-xs text-gold">Add</button>
          </form>
          <div className="mt-2 space-y-2">
            {categories.slice(0, 8).map((category) => (
              <div key={category._id} className="rounded border border-gold/20 p-2 text-xs">
                {editingCategoryId === category._id ? (
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded border border-gold/35 bg-black/35 p-1"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                    />
                    <button type="button" className="rounded border border-gold/35 px-2 text-gold" onClick={saveCategoryEdit}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span>{category.name}</span>
                    <button
                      type="button"
                      className="rounded border border-gold/35 px-2 py-0.5 text-gold"
                      onClick={() => {
                        setEditingCategoryId(category._id);
                        setEditCategoryName(category.name);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Brands</p>
          <form onSubmit={addBrand} className="mt-2 flex gap-2">
            <input
              className="w-full rounded border border-gold/35 bg-black/35 p-2 text-sm"
              placeholder="New brand name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <button className="rounded border border-gold/35 px-3 text-xs text-gold">Add</button>
          </form>
          <div className="mt-2 space-y-2">
            {brands.slice(0, 8).map((brand) => (
              <div key={brand._id} className="rounded border border-gold/20 p-2 text-xs">
                {editingBrandId === brand._id ? (
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded border border-gold/35 bg-black/35 p-1"
                      value={editBrandName}
                      onChange={(e) => setEditBrandName(e.target.value)}
                    />
                    <button type="button" className="rounded border border-gold/35 px-2 text-gold" onClick={saveBrandEdit}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span>{brand.name}</span>
                    <button
                      type="button"
                      className="rounded border border-gold/35 px-2 py-0.5 text-gold"
                      onClick={() => {
                        setEditingBrandId(brand._id);
                        setEditBrandName(brand.name);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
