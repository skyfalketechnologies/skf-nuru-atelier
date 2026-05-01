import Link from "next/link";

export default function AdminContentPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Content Studio</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Blog Module</h1>
        <p className="mt-2 text-sm text-muted">
          Manage your editorial workflow using dedicated internal pages for listing, creating, and editing posts.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/content/homepage-hero"
          className="rounded-2xl border border-gold/25 bg-black/35 p-5 hover:bg-gold/5"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Homepage</p>
          <h2 className="mt-1 font-serif text-xl text-gold">Hero</h2>
          <p className="mt-2 text-sm text-muted">Hero copy, buttons, and background slides.</p>
        </Link>
        <Link href="/admin/content/blog" className="rounded-2xl border border-gold/25 bg-black/35 p-5 hover:bg-gold/5">
          <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Workspace</p>
          <h2 className="mt-1 font-serif text-xl text-gold">Blog Posts</h2>
          <p className="mt-2 text-sm text-muted">Search, filter, publish, and edit existing posts.</p>
        </Link>
        <Link href="/admin/content/blog/new" className="rounded-2xl border border-gold/25 bg-black/35 p-5 hover:bg-gold/5">
          <p className="text-xs uppercase tracking-[0.14em] text-gold/80">Authoring</p>
          <h2 className="mt-1 font-serif text-xl text-gold">Create New Post</h2>
          <p className="mt-2 text-sm text-muted">Write rich content, upload cover image, and publish instantly.</p>
        </Link>
      </div>
    </section>
  );
}
