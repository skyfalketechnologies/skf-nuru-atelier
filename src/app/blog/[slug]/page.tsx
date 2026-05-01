import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryToSlug, getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
      description: "The requested blog article could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.seoDescription,
    openGraph: {
      title: post.title,
      description: post.seoDescription,
      type: "article",
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const allPosts = await getAllBlogPosts();
  const relatedPosts = allPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Link href="/blog" className="inline-flex text-sm text-gold hover:text-foreground">
        ← Back to blog
      </Link>

      <article className="space-y-6">
        <header className="space-y-3">
          <Link
            href={`/blog/category/${categoryToSlug(post.category)}`}
            className="inline-flex text-xs tracking-[0.22em] text-gold hover:text-foreground"
          >
            {post.category.toUpperCase()}
          </Link>
          <h1 className="section-title text-4xl leading-tight sm:text-5xl">{post.title}</h1>
          <p className="text-sm text-muted">
            By {post.author} ·{" "}
            {new Date(post.publishedAt).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {post.readTimeMinutes} min read
          </p>
        </header>

        <div
          className="h-64 rounded-2xl bg-cover bg-center sm:h-96"
          style={{ backgroundImage: `url(${post.coverImage})` }}
        />

        <div className="luxury-card rounded-2xl p-6 sm:p-8">
          <div className="space-y-5 text-sm leading-8 text-muted sm:text-base">
            {post.content.map((paragraph, index) => (
              <div
                key={`${post.slug}-${index}`}
                className="prose prose-invert max-w-none prose-p:my-4 prose-headings:text-gold prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            ))}
          </div>
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="section-title text-3xl">Related Articles</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {relatedPosts.map((item) => (
            <Link key={item.slug} href={`/blog/${item.slug}`} className="luxury-card hover-lift rounded-xl p-4">
              <p className="text-xs tracking-[0.15em] text-gold">{item.category.toUpperCase()}</p>
              <h3 className="section-title mt-2 text-2xl leading-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
