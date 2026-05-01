"use client";

import { useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export type HeroImageToastTone = "info" | "success" | "error";

type HeroImageUploaderProps = {
  urls: string[];
  onChange: (next: string[]) => void;
  max?: number;
  disabled?: boolean;
  onToast: (message: string, tone: HeroImageToastTone) => void;
  folder?: string;
};

export function HeroImageUploader({
  urls,
  onChange,
  max = 6,
  disabled = false,
  onToast,
  folder = "/nuru-atelier/homepage-hero",
}: HeroImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  function move(from: number, to: number) {
    if (to < 0 || to >= urls.length || from === to) return;
    const next = [...urls];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  async function uploadImage(file: File) {
    const token = getAuthToken();
    if (!token) {
      onToast("Login required.", "error");
      return;
    }
    if (urls.length >= max) {
      onToast(`You can add at most ${max} hero images. Remove one to upload another.`, "error");
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

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `hero-${Date.now()}-${safeName}`);
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
        throw new Error(uploadData.error?.message || "Upload failed");
      }
      onChange([...urls, uploadData.url]);
      onToast("Image uploaded.", "success");
    } catch {
      onToast("Upload failed. Check ImageKit keys in backend .env and try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      if (urls.length >= max) {
        onToast(`Only ${max} images allowed; extra files were skipped.`, "info");
        break;
      }
      await uploadImage(file);
    }
  }

  function addManualUrl() {
    const t = manualUrl.trim();
    if (!t) return;
    let parsed: URL;
    try {
      parsed = new URL(t);
    } catch {
      onToast("Enter a full URL starting with https://", "error");
      return;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      onToast("URL must start with http:// or https://", "error");
      return;
    }
    if (urls.length >= max) {
      onToast(`At most ${max} hero images.`, "error");
      return;
    }
    onChange([...urls, t]);
    setManualUrl("");
    onToast("URL added.", "success");
  }

  const atCapacity = urls.length >= max;

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.12em] text-gold/80">Upload images</p>
      <p className="text-xs text-muted">
        Images are stored in ImageKit (same as products). Order matches the hero slideshow left to right. Up to {max}{" "}
        slides.
      </p>

      <div
        className={`rounded-lg border border-dashed p-6 text-center text-xs transition-colors ${
          dragActive ? "border-gold bg-gold/10 text-gold" : "border-gold/35 text-muted"
        } ${disabled || uploading || atCapacity ? "pointer-events-none opacity-60" : ""}`}
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
          if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
        }}
      >
        <p>{atCapacity ? `Maximum ${max} images reached.` : "Drag and drop images here, or"}</p>
        {!atCapacity ? (
          <label className="mt-2 inline-block cursor-pointer rounded-full border border-gold/40 px-3 py-1 text-gold hover:bg-gold/10">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={disabled || uploading || atCapacity}
              onChange={(e) => {
                const list = e.target.files;
                if (list?.length) void uploadFiles(list);
                e.target.value = "";
              }}
            />
            choose files
          </label>
        ) : null}
        {uploading ? <p className="mt-2 text-gold/90">Uploading…</p> : null}
      </div>

      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <input
          type="url"
          className="min-w-0 flex-1 rounded border border-gold/40 bg-black px-3 py-2 text-sm"
          placeholder="Or paste image URL (https://…)"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          disabled={disabled || atCapacity}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addManualUrl();
            }
          }}
        />
        <button
          type="button"
          className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
          disabled={disabled || atCapacity || !manualUrl.trim()}
          onClick={addManualUrl}
        >
          Add URL
        </button>
      </div>

      {urls.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable={!disabled}
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingIndex === null) return;
                move(draggingIndex, index);
                setDraggingIndex(null);
              }}
              onDragEnd={() => setDraggingIndex(null)}
              className={`rounded-lg border p-2 ${
                draggingIndex === index ? "border-gold bg-gold/10" : "border-gold/30"
              }`}
            >
              <span className="mb-1 inline-block rounded bg-gold/15 px-1.5 py-0.5 text-[10px] text-gold">
                Slide {index + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="mt-1 h-24 w-full rounded-md object-cover" />
              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  className="rounded border border-gold/35 px-2 py-0.5 text-[10px] text-gold disabled:opacity-40"
                  onClick={() => move(index, index - 1)}
                  disabled={disabled || index === 0}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded border border-gold/35 px-2 py-0.5 text-[10px] text-gold disabled:opacity-40"
                  onClick={() => move(index, index + 1)}
                  disabled={disabled || index === urls.length - 1}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rounded border border-red-400/50 px-2 py-0.5 text-[10px] text-red-300"
                  onClick={() => onChange(urls.filter((_, i) => i !== index))}
                  disabled={disabled}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">No custom images yet. Upload above or save empty to use default hero images.</p>
      )}
    </div>
  );
}
