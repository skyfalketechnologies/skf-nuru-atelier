"use client";

import { useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type ToastTone = "info" | "success" | "error";

type BlogCoverUploaderProps = {
  coverImage: string;
  onCoverImageChange: (value: string) => void;
  disabled?: boolean;
  onToast: (message: string, tone: ToastTone) => void;
  folder?: string;
};

export function BlogCoverUploader({
  coverImage,
  onCoverImageChange,
  disabled = false,
  onToast,
  folder = "/nuru-atelier/blog",
}: BlogCoverUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
      onCoverImageChange(uploadData.url);
      onToast("Cover image uploaded.", "success");
    } catch {
      onToast("Image upload failed. Check ImageKit env keys.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-gold/20 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-gold/80">Cover Image</p>
      <div
        className={`rounded-lg border border-dashed p-4 text-center text-xs transition-colors ${
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
          const file = e.dataTransfer.files?.[0];
          if (file) uploadImage(file);
        }}
      >
        <p>Drag one image here, or</p>
        <label className="mt-2 inline-block cursor-pointer rounded-full border border-gold/40 px-3 py-1 text-gold hover:bg-gold/10">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
              e.target.value = "";
            }}
          />
          choose file
        </label>
        {uploading ? <p className="mt-2 text-gold/90">Uploading…</p> : null}
      </div>

      <label className="block text-xs text-muted">
        Cover image URL
        <input
          className="mt-1 w-full rounded-lg border border-gold/35 bg-black/35 px-3 py-2 text-sm text-foreground placeholder:text-muted"
          placeholder="https://..."
          value={coverImage}
          onChange={(e) => onCoverImageChange(e.target.value)}
          disabled={disabled}
        />
      </label>

      {coverImage ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImage} alt="Blog cover preview" className="h-36 w-full rounded-md object-cover" />
          <button
            type="button"
            className="rounded border border-red-400/50 px-2 py-1 text-[11px] text-red-300"
            onClick={() => onCoverImageChange("")}
            disabled={disabled}
          >
            Remove image
          </button>
        </div>
      ) : null}
    </div>
  );
}
