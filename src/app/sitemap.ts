import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
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
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const blogPages = getAllBlogPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}

