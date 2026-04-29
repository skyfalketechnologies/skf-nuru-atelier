import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  blogCategories,
  categoryToSlug,
  getBlogPostsByCategory,
  slugToCategory,
} from "@/lib/blog";

type BlogCategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return blogCategories.map((category) => ({ category: categoryToSlug(category) }));
}

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const parsedCategory = slugToCategory(category);

  if (!parsedCategory) {
    return {
      title: "Category not found",
      description: "The requested blog category was not found.",
    };
  }

  return {
    title: `${parsedCategory} Articles`,
    description: `Read NURU ATELIER ${parsedCategory.toLowerCase()} stories and guides.`,
  };
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const pageSize = 6;
  const { category } = await params;
  const query = await searchParams;
  const pageParam = typeof query.page === "string" ? Number(query.page) : 1;
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const parsedCategory = slugToCategory(category);
  if (!parsedCategory) notFound();

  const posts = getBlogPostsByCategory(parsedCategory);
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = posts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const buildCategoryPageHref = (targetPage: number) => {
    if (targetPage <= 1) return `/blog/category/${categoryToSlug(parsedCategory)}`;
    return `/blog/category/${categoryToSlug(parsedCategory)}?page=${targetPage}`;
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/blog" className="text-gold hover:text-foreground">
          Blog
        </Link>
        <span>/</span>
        <span>{parsedCategory}</span>
      </div>

      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">CATEGORY</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">{parsedCategory} Articles</h1>
        <p className="mt-2 text-sm text-muted">
          Explore all {parsedCategory.toLowerCase()} stories from the NURU editorial team.
        </p>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
          <article key={post.slug} className="luxury-card hover-lift overflow-hidden rounded-xl">
            <div
              className="h-44 bg-cover bg-center"
              style={{ backgroundImage: `url(${post.coverImage})` }}
            />
            <div className="space-y-2 p-4">
              <Link href={`/blog/category/${categoryToSlug(post.category)}`} className="text-xs tracking-[0.16em] text-gold hover:text-foreground">
                {post.category.toUpperCase()}
              </Link>
              <h2 className="section-title text-2xl leading-tight">{post.title}</h2>
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
        {posts.length > pageSize ? (
          <div className="flex items-center justify-center gap-2 pt-2">
            {safePage > 1 ? (
              <Link
                href={buildCategoryPageHref(safePage - 1)}
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
                href={buildCategoryPageHref(safePage + 1)}
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
