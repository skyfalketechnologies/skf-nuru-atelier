import Link from "next/link";
import type { Metadata } from "next";
import {
  blogCategories,
  categoryToSlug,
  getAllBlogPosts,
  searchBlogPosts,
  slugToCategory,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Fragrance, skincare, gifting, and lifestyle guides from NURU ATELIER to help you choose better and gift beautifully.",
};

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const pageSize = 6;
  const params = await searchParams;
  const searchTerm = typeof params.search === "string" ? params.search : "";
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const selectedCategory = categorySlug ? slugToCategory(categorySlug) : undefined;
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  let posts = searchTerm ? searchBlogPosts(searchTerm) : getAllBlogPosts();
  if (selectedCategory) {
    posts = posts.filter((post) => post.category === selectedCategory);
  }

  const featuredPost = currentPage === 1 ? posts[0] : undefined;
  const postsForGrid = currentPage === 1 ? posts.slice(1) : posts;
  const totalPages = Math.max(1, Math.ceil(postsForGrid.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = postsForGrid.slice((safePage - 1) * pageSize, safePage * pageSize);

  const buildBlogPageHref = (targetPage: number) => {
    const query = new URLSearchParams();
    if (searchTerm) query.set("search", searchTerm);
    if (selectedCategory) query.set("category", categoryToSlug(selectedCategory));
    if (targetPage > 1) query.set("page", String(targetPage));
    const queryString = query.toString();
    return queryString ? `/blog?${queryString}` : "/blog";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">NURU JOURNAL</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Stories, Guides, and Gift Inspiration</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          Explore fragrance education, body care advice, and premium gifting ideas curated by our editorial
          team.
        </p>
        <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            name="search"
            defaultValue={searchTerm}
            placeholder="Search blog articles..."
            className="w-full rounded-full border border-gold/40 bg-black px-4 py-2 text-sm text-foreground placeholder:text-muted"
          />
          <select
            name="category"
            defaultValue={selectedCategory ? categoryToSlug(selectedCategory) : ""}
            className="rounded-full border border-gold/40 bg-black px-4 py-2 text-sm text-foreground"
          >
            <option value="">All categories</option>
            {blogCategories.map((category) => (
              <option key={category} value={categoryToSlug(category)}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            Filter
          </button>
        </form>
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
              href={`/blog/category/${categoryToSlug(featuredPost.category)}`}
              className="inline-flex text-xs tracking-[0.12em] text-gold hover:text-foreground"
            >
              Browse {featuredPost.category}
            </Link>
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
        {!posts.length ? (
          <div className="luxury-card rounded-xl p-6 text-sm text-muted">
            No articles matched your filters. Try a different search term or category.
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <article key={post.slug} className="luxury-card hover-lift overflow-hidden rounded-xl">
              <div
                className="h-44 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.coverImage})` }}
              />
              <div className="space-y-2 p-4">
                <Link
                  href={`/blog/category/${categoryToSlug(post.category)}`}
                  className="text-xs tracking-[0.16em] text-gold hover:text-foreground"
                >
                  {post.category.toUpperCase()}
                </Link>
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
        {postsForGrid.length > pageSize ? (
          <div className="flex items-center justify-center gap-2 pt-2">
            {safePage > 1 ? (
              <Link
                href={buildBlogPageHref(safePage - 1)}
                className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10"
              >
                Previous
              </Link>
            ) : null}
            <span className="text-sm text-muted">
              Page {safePage} of {totalPages}
            </span>
            {safePage < totalPages ? (
              <Link
                href={buildBlogPageHref(safePage + 1)}
                className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-gold/10"
              >
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
