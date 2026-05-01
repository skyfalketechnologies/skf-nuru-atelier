"use client";

import { useMemo, useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { BlogCoverUploader } from "@/components/admin/BlogCoverUploader";
import type { BlogCategory } from "@/lib/blog";

type ToastTone = "info" | "success" | "error";

export type BlogEditorValues = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  coverImage: string;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  seoDescription: string;
  contentHtml: string;
  isPublished: boolean;
};

type BlogPostEditorProps = {
  value: BlogEditorValues;
  onChange: (next: BlogEditorValues) => void;
  categories: BlogCategory[];
  disabled?: boolean;
  onSubmit: () => Promise<void> | void;
  submitLabel: string;
  onCancel?: () => void;
  onToast: (message: string, tone: ToastTone) => void;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostEditor({
  value,
  onChange,
  categories,
  disabled = false,
  onSubmit,
  submitLabel,
  onCancel,
  onToast,
}: BlogPostEditorProps) {
  const [slugTouched, setSlugTouched] = useState(false);
  const safeCategories = useMemo(
    () => (categories.length ? categories : ["Fragrance", "Skincare", "Gifting", "Lifestyle"]),
    [categories]
  );

  return (
    <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-muted sm:col-span-2">
          Title
          <input
            value={value.title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              onChange({
                ...value,
                title: nextTitle,
                slug: slugTouched ? value.slug : createSlug(nextTitle),
              });
            }}
            placeholder="Blog title"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Slug
          <input
            value={value.slug}
            onChange={(e) => {
              setSlugTouched(true);
              onChange({ ...value, slug: e.target.value.toLowerCase() });
            }}
            placeholder="slug-kebab-case"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <label className="text-xs text-muted">
          Author
          <input
            value={value.author}
            onChange={(e) => onChange({ ...value, author: e.target.value })}
            placeholder="Author"
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <label className="text-xs text-muted">
          Category
          <select
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value as BlogCategory })}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          >
            {safeCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Publish date
          <input
            type="date"
            value={value.publishedAt}
            onChange={(e) => onChange({ ...value, publishedAt: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <label className="text-xs text-muted">
          Read time (minutes)
          <input
            type="number"
            min={1}
            value={value.readTimeMinutes}
            onChange={(e) => onChange({ ...value, readTimeMinutes: Number(e.target.value || 1) })}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
          <input
            type="checkbox"
            checked={value.isPublished}
            onChange={(e) => onChange({ ...value, isPublished: e.target.checked })}
            disabled={disabled}
          />
          Published
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          Excerpt
          <textarea
            value={value.excerpt}
            onChange={(e) => onChange({ ...value, excerpt: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <label className="text-xs text-muted sm:col-span-2">
          SEO description
          <textarea
            value={value.seoDescription}
            onChange={(e) => onChange({ ...value, seoDescription: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
            disabled={disabled}
          />
        </label>
        <div className="sm:col-span-2">
          <BlogCoverUploader
            coverImage={value.coverImage}
            onCoverImageChange={(coverImage) => onChange({ ...value, coverImage })}
            disabled={disabled}
            onToast={onToast}
          />
        </div>
        <div className="sm:col-span-2">
          <RichTextEditor
            label="Article Content"
            value={value.contentHtml}
            onChange={(contentHtml) => onChange({ ...value, contentHtml })}
            placeholder="Write article body..."
          />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {submitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
