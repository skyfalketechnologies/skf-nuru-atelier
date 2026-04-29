import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="luxury-card rounded-2xl px-6 py-16 sm:px-10">
        <p className="mb-4 text-xs tracking-[0.25em] text-gold">LUXURY ESSENTIALS</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight text-foreground sm:text-7xl">
          NURU ATELIER
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          An editorial luxury experience in fragrance, body rituals, jewelry, and curated gift
          ateliers. Crafted for those who appreciate mystery, elegance, and timeless sophistication.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:opacity-90">
            Explore Collection
          </Link>
          <Link href="/gift-customization" className="gold-border rounded-full px-6 py-3 text-sm text-gold hover:bg-gold/10">
            Build Gift Atelier
          </Link>
        </div>
      </div>
    </section>
  );
}
