"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import { BLOG_DEFAULT_VALUES, editorValuesToPayload, postToEditorValues } from "@/lib/adminBlog";
import type { BlogCategory, BlogPost } from "@/lib/blog";

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState(BLOG_DEFAULT_VALUES);
  const [categories, setCategories] = useState<BlogCategory[]>(["Fragrance", "Skincare", "Gifting", "Lifestyle"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");

  function notify(nextMessage: string, tone: "info" | "success" | "error") {
    setMessage(nextMessage);
    setToastTone(tone);
  }

  async function loadPost() {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetAuth<{ post: BlogPost; categories: BlogCategory[] }>(
        `/api/blog/admin/posts/${params.id}`,
        token
      );
      setForm(postToEditorValues(data.post));
      if (data.categories?.length) setCategories(data.categories);
    } catch {
      notify("Could not load blog post.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPost();
  }, [params.id]);

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
      await apiPatchAuth(`/api/blog/admin/posts/${params.id}`, payload, token);
      notify("Blog post updated.", "success");
      router.push("/admin/content/blog");
    } catch {
      notify("Could not update blog post.", "error");
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
            <h1 className="mt-1 font-serif text-2xl text-gold">Edit Blog Post</h1>
          </div>
          <Link href="/admin/content/blog" className="rounded-full border border-gold/35 px-4 py-2 text-sm text-gold">
            Back to Posts
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="rounded-2xl border border-gold/25 bg-black/35 p-5 text-sm text-muted">Loading post...</div>
      ) : (
        <BlogPostEditor
          value={form}
          onChange={setForm}
          categories={categories}
          disabled={saving}
          onSubmit={savePost}
          submitLabel={saving ? "Saving..." : "Update Post"}
          onToast={notify}
          onCancel={() => router.push("/admin/content/blog")}
        />
      )}
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
