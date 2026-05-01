import type { MetadataRoute } from "next";
import { blogCategories, categoryToSlug, getAllBlogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://nuruatelier.com";
  const staticPages = [
    "",
    "/shop",
    "/blog",
    "/gift-customization",
    "/about",
    "/contact",
    "/cart",
    "/admin",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const blogPosts = await getAllBlogPosts().catch(() => []);
  const blogPages = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogCategoryPages = blogCategories.map((category) => ({
    url: `${base}/blog/category/${categoryToSlug(category)}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages, ...blogCategoryPages];
}

