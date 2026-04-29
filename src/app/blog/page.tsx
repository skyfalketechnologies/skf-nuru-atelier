import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Fragrance, skincare, gifting, and lifestyle guides from NURU ATELIER to help you choose better and gift beautifully.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">NURU JOURNAL</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Stories, Guides, and Gift Inspiration</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          Explore fragrance education, body care advice, and premium gifting ideas curated by our editorial
          team.
        </p>
      </section>

      {featuredPost ? (
        <section className="luxury-card overflow-hidden rounded-2xl">
          <div
            className="h-56 bg-cover bg-center sm:h-72"
            style={{ backgroundImage: `url(${featuredPost.coverImage})` }}
          />
          <div className="space-y-3 p-6 sm:p-8">
            <p className="text-xs tracking-[0.22em] text-gold">FEATURED ARTICLE</p>
            <h2 className="section-title text-3xl">{featuredPost.title}</h2>
            <p className="text-sm text-muted">
              {new Date(featuredPost.publishedAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {featuredPost.readTimeMinutes} min read · {featuredPost.category}
            </p>
            <p className="max-w-3xl text-sm leading-7 text-muted">{featuredPost.excerpt}</p>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="inline-flex rounded-full bg-gold px-5 py-2 text-sm font-medium text-black hover:opacity-90"
            >
              Read article
            </Link>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="section-title text-3xl">Latest Articles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => (
            <article key={post.slug} className="luxury-card hover-lift overflow-hidden rounded-xl">
              <div
                className="h-44 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.coverImage})` }}
              />
              <div className="space-y-2 p-4">
                <p className="text-xs tracking-[0.16em] text-gold">{post.category.toUpperCase()}</p>
                <h3 className="section-title text-2xl leading-tight">{post.title}</h3>
                <p className="text-sm text-muted">{post.excerpt}</p>
                <p className="text-xs text-muted">
                  {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {post.readTimeMinutes} min read
                </p>
                <Link href={`/blog/${post.slug}`} className="text-sm text-gold hover:text-foreground">
                  Continue reading
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
