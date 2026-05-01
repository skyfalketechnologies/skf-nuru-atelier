"use client";

import { useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type ToastTone = "info" | "success" | "error";

type ProductImageUploaderProps = {
  imageUrls: string;
  onImageUrlsChange: (next: string) => void;
  disabled?: boolean;
  onToast: (message: string, tone: ToastTone) => void;
  folder?: string;
};

export function ProductImageUploader({
  imageUrls,
  onImageUrlsChange,
  disabled = false,
  onToast,
  folder = "/nuru-atelier/products",
}: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(null);

  const imageList = imageUrls
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  function syncImageList(next: string[]) {
    onImageUrlsChange(next.join(", "));
  }

  async function uploadImage(file: File) {
    const token = getAuthToken();
    if (!token) {
      onToast("Login required.", "error");
      return;
    }

    setUploading(true);
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
      formData.append("folder", folder);
      formData.append("useUniqueFileName", "true");

      const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = (await uploadResponse.json()) as {
        url?: string;
        error?: { message?: string };
      };
      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error(uploadData.error?.message || "Image upload failed");
      }
      const prev = imageUrls.trim();
      onImageUrlsChange(prev ? `${prev}, ${uploadData.url}` : uploadData.url);
      onToast("Image uploaded and added.", "success");
    } catch {
      onToast("Image upload failed. Check ImageKit env keys.", "error");
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

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.12em] text-gold/80">Media</p>
      <p className="text-xs text-muted">
        First image is the catalog thumbnail. Drag tiles to reorder. You can also paste URLs below (comma-separated).
      </p>
      <div
        className={`rounded-lg border border-dashed p-6 text-center text-xs transition-colors ${
          dragActive ? "border-gold bg-gold/10 text-gold" : "border-gold/35 text-muted"
        } ${disabled || uploading ? "pointer-events-none opacity-60" : ""}`}
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
        <p>Drag and drop images here, or</p>
        <label className="mt-2 inline-block cursor-pointer rounded-full border border-gold/40 px-3 py-1 text-gold hover:bg-gold/10">
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(e) => {
              const list = e.target.files;
              if (list?.length) uploadFiles(list);
              e.target.value = "";
            }}
          />
          choose files
        </label>
        {uploading ? <p className="mt-2 text-gold/90">Uploading…</p> : null}
      </div>

      <label className="block text-xs text-muted">
        Image URLs (comma-separated, optional manual edit)
        <textarea
          className="mt-1 w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 font-mono text-[11px] text-foreground placeholder:text-muted"
          rows={2}
          placeholder="https://..."
          value={imageUrls}
          onChange={(e) => onImageUrlsChange(e.target.value)}
          disabled={disabled}
        />
      </label>

      {imageList.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {imageList.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable={!disabled}
              onDragStart={() => setDraggingImageIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingImageIndex === null) return;
                moveImage(draggingImageIndex, index);
                setDraggingImageIndex(null);
              }}
              onDragEnd={() => setDraggingImageIndex(null)}
              className={`rounded-lg border p-2 ${
                draggingImageIndex === index ? "border-gold bg-gold/10" : "border-gold/30"
              }`}
            >
              {index === 0 ? (
                <span className="mb-1 inline-block rounded bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                  Cover
                </span>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product ${index + 1}`} className="h-24 w-full rounded-md object-cover" />
              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  className="rounded border border-gold/35 px-2 py-0.5 text-[10px] text-gold disabled:opacity-40"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={disabled || index === 0}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded border border-gold/35 px-2 py-0.5 text-[10px] text-gold disabled:opacity-40"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={disabled || index === imageList.length - 1}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rounded border border-red-400/50 px-2 py-0.5 text-[10px] text-red-300"
                  onClick={() => removeImageAt(index)}
                  disabled={disabled}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
