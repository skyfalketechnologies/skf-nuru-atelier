"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDeleteAuth, apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import type { BlogCategory, BlogPost } from "@/lib/blog";
import type { BlogAdminResponse } from "@/lib/adminBlog";

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>(["Fragrance", "Skincare", "Gifting", "Lifestyle"]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | BlogCategory>("all");
  const [loading, setLoading] = useState(true);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");

  function notify(nextMessage: string, tone: "info" | "success" | "error") {
    setMessage(nextMessage);
    setToastTone(tone);
  }

  async function loadBlogAdminData() {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (status !== "all") params.set("status", status);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const data = await apiGetAuth<BlogAdminResponse>(`/api/blog/admin/posts?${params.toString()}`, token);
      setPosts(data.posts || []);
      if (data.categories?.length) setCategories(data.categories);
      setPublishedCount(data.summary?.publishedCount ?? 0);
      setDraftCount(data.summary?.draftCount ?? 0);
    } catch {
      notify("Unable to load blog posts.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogAdminData();
  }, []);

  async function deletePost(postId: string) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await apiDeleteAuth(`/api/blog/admin/posts/${postId}`, token);
      notify("Blog post deleted.", "success");
      await loadBlogAdminData();
    } catch {
      notify("Could not delete post.", "error");
    }
  }

  async function togglePublish(post: BlogPost) {
    const token = getAuthToken();
    if (!token || !post._id) return;
    try {
      await apiPatchAuth(`/api/blog/admin/posts/${post._id}`, { isPublished: !post.isPublished }, token);
      notify(post.isPublished ? "Moved post to draft." : "Published post.", "success");
      await loadBlogAdminData();
    } catch {
      notify("Could not update publish state.", "error");
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Content Studio</p>
            <h1 className="mt-1 font-serif text-2xl text-gold">Blog Posts</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/content" className="rounded-full border border-gold/35 px-4 py-2 text-sm text-gold">
              Overview
            </Link>
            <Link href="/admin/content/blog/new" className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-black">
              New Post
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-200">Published: {publishedCount}</span>
          <span className="rounded-full border border-amber-500/40 px-3 py-1 text-amber-100">Drafts: {draftCount}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blog posts..." className="rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value as "all" | "published" | "draft")} className="rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as "all" | BlogCategory)} className="rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm">
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              void loadBlogAdminData();
            }}
            className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold"
          >
            Refresh
          </button>
        </div>
        <div className="space-y-2">
          {loading ? <p className="text-sm text-muted">Loading posts...</p> : null}
          {!loading && !posts.length ? <p className="text-sm text-muted">No blog posts found.</p> : null}
          {posts.map((post) => (
            <div key={post._id || post.slug} className="rounded-lg border border-gold/20 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{post.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${post.isPublished ? "border border-emerald-500/35 text-emerald-200" : "border border-amber-500/35 text-amber-100"}`}>
                  {post.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{post.slug} · {post.category} · {post.author}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {post._id ? (
                  <Link href={`/admin/content/blog/${post._id}/edit`} className="rounded border border-gold/35 px-2 py-1 text-xs text-gold">
                    Edit
                  </Link>
                ) : null}
                <button type="button" onClick={() => togglePublish(post)} className="rounded border border-gold/35 px-2 py-1 text-xs text-gold">
                  {post.isPublished ? "Move to Draft" : "Publish"}
                </button>
                {post._id ? (
                  <button type="button" onClick={() => deletePost(post._id as string)} className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-200">
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
