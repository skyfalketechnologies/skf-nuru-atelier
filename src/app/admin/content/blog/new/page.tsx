"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPostAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import { BLOG_DEFAULT_VALUES, editorValuesToPayload } from "@/lib/adminBlog";
import type { BlogCategory } from "@/lib/blog";

const BLOG_CATEGORIES: BlogCategory[] = ["Fragrance", "Skincare", "Gifting", "Lifestyle"];

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [form, setForm] = useState(BLOG_DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");

  function notify(nextMessage: string, tone: "info" | "success" | "error") {
    setMessage(nextMessage);
    setToastTone(tone);
  }

  async function savePost() {
    const token = getAuthToken();
    if (!token) return;
    const payload = editorValuesToPayload(form);
    if (!payload.slug || !payload.title || !payload.excerpt || !payload.coverImage || !payload.content.length) {
      notify("Fill all required blog fields before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      await apiPostAuth("/api/blog/admin/posts", payload, token);
      notify("Blog post created.", "success");
      router.push("/admin/content/blog");
    } catch {
      notify("Blog save failed. Check required fields and slug uniqueness.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Content Studio</p>
            <h1 className="mt-1 font-serif text-2xl text-gold">Create Blog Post</h1>
          </div>
          <Link href="/admin/content/blog" className="rounded-full border border-gold/35 px-4 py-2 text-sm text-gold">
            Back to Posts
          </Link>
        </div>
      </div>
      <BlogPostEditor
        value={form}
        onChange={setForm}
        categories={BLOG_CATEGORIES}
        disabled={saving}
        onSubmit={savePost}
        submitLabel={saving ? "Saving..." : "Create Post"}
        onToast={notify}
      />
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
