"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDeleteAuth, apiGetAuth, apiPatchAuth, apiPostAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Product = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  stock: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [priceKes, setPriceKes] = useState("0");
  const [stock, setStock] = useState("0");
  const [categorySlug, setCategorySlug] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(null);

  const [editingId, setEditingId] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const imageList = imageUrls
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  function syncImageList(next: string[]) {
    setImageUrls(next.join(", "));
  }

  async function loadProducts() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    await apiGetAuth<{ products: Product[] }>("/api/admin/products", token)
      .then((data) => setProducts(data.products))
      .catch(() => {
        setMessage("Login required for product management.");
        setToastTone("error");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      setMessage("Login required.");
      return;
    }
    const images = imageUrls
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    try {
      await apiPostAuth(
        "/api/admin/products",
        {
          name,
          slug,
          description: description || `${name} description`,
          categorySlug,
          brandSlug,
          images: images.length ? images : ["https://images.unsplash.com/photo-1541643600914-78b084683601"],
          priceKes: Number(priceKes),
          stock: Number(stock),
          isActive: true,
        },
        token
      );
      setMessage("Product created.");
      setToastTone("success");
      setName("");
      setSlug("");
      setDescription("");
      setImageUrls("");
      setPriceKes("0");
      setStock("0");
      await loadProducts();
    } catch {
      setMessage("Creation failed. Ensure valid category/brand slugs.");
      setToastTone("error");
    }
  }

  async function checkImageKit() {
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiGetAuth("/api/admin/imagekit/auth", token);
      setMessage("ImageKit auth endpoint is configured and reachable.");
      setToastTone("success");
    } catch {
      setMessage("ImageKit is not configured yet. Add IMAGEKIT keys in backend env.");
      setToastTone("error");
    }
  }

  async function uploadImage(file: File) {
    const token = getAuthToken();
    if (!token) {
      setMessage("Login required.");
      return;
    }

    setUploading(true);
    setMessage("");
    try {
      const auth = await apiGetAuth<{
        token: string;
        expire: number;
        signature: string;
        publicKey: string;
      }>("/api/admin/imagekit/auth", token);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${Date.now()}-${file.name}`);
      formData.append("publicKey", auth.publicKey);
      formData.append("token", auth.token);
      formData.append("expire", String(auth.expire));
      formData.append("signature", auth.signature);
      formData.append("folder", "/nuru-atelier/products");
      formData.append("useUniqueFileName", "true");

      const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = (await uploadResponse.json()) as { url?: string; error?: { message?: string } };
      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error(uploadData.error?.message || "Image upload failed");
      }

      setImageUrls((prev) => (prev.trim() ? `${prev}, ${uploadData.url}` : uploadData.url));
      setMessage("Image uploaded and added to image URLs.");
      setToastTone("success");
    } catch {
      setMessage("Image upload failed. Check ImageKit env keys and try again.");
      setToastTone("error");
    } finally {
      setUploading(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      await uploadImage(file);
    }
  }

  function removeImageAt(index: number) {
    syncImageList(imageList.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= imageList.length || from === to) return;
    const next = [...imageList];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    syncImageList(next);
  }

  async function saveEdit(productId: string) {
    const token = getAuthToken();
    if (!token) return;
    await apiPatchAuth(
      `/api/admin/products/${productId}`,
      { priceKes: Number(editPrice), stock: Number(editStock) },
      token
    );
    setEditingId("");
    await loadProducts();
  }

  async function removeProduct(productId: string) {
    const token = getAuthToken();
    if (!token) return;
    await apiDeleteAuth(`/api/admin/products/${productId}`, token);
    setMessage("Product deleted.");
    setToastTone("success");
    await loadProducts();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-2xl text-gold sm:text-3xl">Admin Products</h1>
      {message && !loading ? (
        <div className="mt-2 flex items-center gap-3 text-sm text-muted">
          <span>{message}</span>
          <button className="text-gold underline" onClick={loadProducts}>
            Retry
          </button>
        </div>
      ) : null}
      <form onSubmit={createProduct} className="mt-5 grid gap-3 sm:grid-cols-2">
        <input className="rounded border border-gold/40 bg-black p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded border border-gold/40 bg-black p-2" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="rounded border border-gold/40 bg-black p-2" placeholder="Price KES" value={priceKes} onChange={(e) => setPriceKes(e.target.value)} />
        <input className="rounded border border-gold/40 bg-black p-2" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
        <input className="rounded border border-gold/40 bg-black p-2 sm:col-span-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="rounded border border-gold/40 bg-black p-2 sm:col-span-2" placeholder="Image URLs (comma-separated)" value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} />
        <label className="rounded border border-gold/40 p-2 sm:col-span-2 text-sm text-muted">
          Upload product image
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block w-full text-xs"
            onChange={(e) => {
              if (e.target.files?.length) uploadFiles(e.target.files);
            }}
          />
        </label>
        <div
          className={`sm:col-span-2 rounded border border-dashed p-4 text-center text-sm ${
            dragActive ? "border-gold bg-gold/10 text-gold" : "border-gold/40 text-muted"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
          }}
        >
          Drag and drop images here for upload
        </div>
        {imageList.length ? (
          <div className="sm:col-span-2 grid grid-cols-2 gap-3 md:grid-cols-4">
            {imageList.map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={() => setDraggingImageIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingImageIndex === null) return;
                  moveImage(draggingImageIndex, index);
                  setDraggingImageIndex(null);
                }}
                onDragEnd={() => setDraggingImageIndex(null)}
                className={`rounded border p-2 ${
                  draggingImageIndex === index ? "border-gold bg-gold/10" : "border-gold/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Uploaded product ${index + 1}`} className="h-24 w-full rounded object-cover" />
                <div className="mt-2 flex items-center justify-between gap-1 text-xs">
                  <span className="text-muted">Drag to reorder</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded border border-gold/40 px-2 py-1 text-gold disabled:opacity-40"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move image left"
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      className="rounded border border-gold/40 px-2 py-1 text-gold disabled:opacity-40"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={index === imageList.length - 1}
                      aria-label="Move image right"
                    >
                      Right
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-400/50 px-2 py-1 text-red-300"
                      onClick={() => removeImageAt(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <input className="rounded border border-gold/40 bg-black p-2" placeholder="Category slug (e.g perfumes)" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} />
        <input className="rounded border border-gold/40 bg-black p-2" placeholder="Brand slug (e.g skyfalke)" value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} />
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-gold px-5 py-2 text-black" disabled={uploading}>
            {uploading ? "Uploading..." : "Create Product"}
          </button>
          <button type="button" className="rounded-full border border-gold/40 px-5 py-2 text-gold" onClick={checkImageKit}>
            Check ImageKit
          </button>
        </div>
      </form>
      <div className="mt-6 grid gap-3">
        {loading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 animate-pulse rounded border border-gold/20 bg-white/5" />
            ))
          : null}
        {products.map((product) => (
          <div key={product._id} className="rounded border border-gold/30 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                {product.name} - Ksh {product.priceKes.toLocaleString()} - Stock {product.stock}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-gold/40 px-2 py-1 text-xs text-gold"
                  onClick={() => {
                    setEditingId(product._id);
                    setEditPrice(String(product.priceKes));
                    setEditStock(String(product.stock));
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded border border-red-400/60 px-2 py-1 text-xs text-red-300"
                  onClick={() => setConfirmDeleteProductId(product._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            {editingId === product._id ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <input className="rounded border border-gold/40 bg-black p-1" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                <input className="rounded border border-gold/40 bg-black p-1" value={editStock} onChange={(e) => setEditStock(e.target.value)} />
                <button className="rounded bg-gold px-2 py-1 text-xs text-black" onClick={() => saveEdit(product._id)}>
                  Save
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(confirmDeleteProductId)}
        title="Delete Product"
        description="This action cannot be undone. Do you want to permanently delete this product?"
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteProductId("")}
        onConfirm={async () => {
          await removeProduct(confirmDeleteProductId);
          setConfirmDeleteProductId("");
        }}
      />
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}

