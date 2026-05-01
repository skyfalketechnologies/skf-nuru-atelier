export type BlogPost = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Fragrance" | "Skincare" | "Gifting" | "Lifestyle";
  coverImage: string;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  seoDescription: string;
  content: string[];
  isPublished?: boolean;
};

export const blogCategories = ["Fragrance", "Skincare", "Gifting", "Lifestyle"] as const;
export type BlogCategory = (typeof blogCategories)[number];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type BlogListParams = {
  search?: string;
  category?: BlogCategory;
  page?: number;
  limit?: number;
  includeDrafts?: boolean;
};

export async function fetchBlogPosts(params: BlogListParams = {}): Promise<{
  posts: BlogPost[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.includeDrafts) query.set("includeDrafts", "true");
  const url = `${API_URL}/api/blog/posts${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`Blog API error: ${response.status}`);
  return response.json();
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const data = await fetchBlogPosts({ page: 1, limit: 50 });
  return data.posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const response = await fetch(`${API_URL}/api/blog/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Blog API error: ${response.status}`);
  const data = await response.json();
  return data.post;
}

export function categoryToSlug(category: BlogCategory): string {
  return category.toLowerCase();
}

export function slugToCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((category) => categoryToSlug(category) === slug.toLowerCase());
}

export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  const data = await fetchBlogPosts({ category, page: 1, limit: 50 });
  return data.posts;
}

export async function searchBlogPosts(term: string): Promise<BlogPost[]> {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) return getAllBlogPosts();
  const data = await fetchBlogPosts({ search: normalizedTerm, page: 1, limit: 50 });
  return data.posts;
}
