import type { BlogCategory, BlogPost } from "@/lib/blog";
import type { BlogEditorValues } from "@/components/admin/BlogPostEditor";

export type BlogAdminResponse = {
  posts: BlogPost[];
  categories: BlogCategory[];
  pagination: { page: number; total: number; totalPages: number; limit: number };
  summary: { publishedCount: number; draftCount: number };
};

export const BLOG_DEFAULT_VALUES: BlogEditorValues = {
  slug: "",
  title: "",
  excerpt: "",
  category: "Fragrance",
  coverImage: "",
  author: "NURU Editorial",
  publishedAt: new Date().toISOString().slice(0, 10),
  readTimeMinutes: 5,
  seoDescription: "",
  contentHtml: "",
  isPublished: true,
};

export function postToEditorValues(post: BlogPost): BlogEditorValues {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    coverImage: post.coverImage,
    author: post.author,
    publishedAt: String(post.publishedAt).slice(0, 10),
    readTimeMinutes: post.readTimeMinutes,
    seoDescription: post.seoDescription,
    contentHtml: (post.content || []).join("\n"),
    isPublished: Boolean(post.isPublished),
  };
}

export function editorValuesToPayload(values: BlogEditorValues) {
  const html = values.contentHtml.trim();
  return {
    slug: values.slug.trim(),
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    category: values.category,
    coverImage: values.coverImage.trim(),
    author: values.author.trim(),
    publishedAt: values.publishedAt,
    readTimeMinutes: Number(values.readTimeMinutes || 1),
    seoDescription: values.seoDescription.trim(),
    content: html ? [html] : [],
    isPublished: values.isPublished,
  };
}
