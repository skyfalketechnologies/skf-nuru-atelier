import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NURU ATELIER",
  description:
    "Learn about NURU ATELIER, founded to make rare and luxurious curated finds accessible across Kenya.",
  keywords: [
    "best giftshop in Kenya",
    "Perfumes stores in Kenya",
    "Best Gift shop in Nairobi",
    "best gift shop in mombasa",
    "best gift shop in Nakuru",
  ],
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="luxury-card rounded-2xl p-6 sm:p-9">
        <p className="text-xs tracking-[0.3em] text-gold">OUR HOUSE</p>
        <h1 className="section-title mt-3 text-4xl sm:text-5xl">About NURU ATELIER</h1>
        <p className="mt-4 max-w-3xl leading-8 text-muted">
          NURU ATELIER was started to make it easy to find rare and luxurious curated finds for the
          people you love most. Our guiding promise is simple: <span className="text-foreground">Illuminate your presence.</span>
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-[1.15fr_0.85fr]">
        <article className="luxury-card rounded-2xl p-6 sm:p-8">
          <p className="text-xs tracking-[0.2em] text-gold">BRAND STORY</p>
          <h2 className="section-title mt-2 text-3xl">Our Uniqueness</h2>
          <p className="mt-4 text-sm leading-8 text-muted">
            We deliver gifts personally to your beloved with love, care, and a truly personal touch.
            Every package is prepared to feel intimate, thoughtful, and worthy of the moment.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gold/25 bg-black/30 p-4 text-sm text-muted">
              Rare and luxurious curated finds
            </div>
            <div className="rounded-xl border border-gold/25 bg-black/30 p-4 text-sm text-muted">
              Personal delivery made with love for your beloved
            </div>
          </div>
        </article>
        <div className="luxury-card relative min-h-[320px] overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1400&q=80)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6 sm:p-7">
            <p className="text-xs tracking-[0.25em] text-gold">NURU ATELIER</p>
            <h3 className="section-title mt-2 text-2xl text-white">Curated luxury for meaningful moments</h3>
            <p className="mt-2 max-w-sm text-sm leading-7 text-neutral-200">Illuminate your presence.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">OUR PHILOSOPHY</p>
          <h2 className="section-title mt-2 text-3xl text-foreground">Meaningful gifting, personally delivered</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Rare by Design",
              description: "Each gift is curated to feel distinctive, elegant, and deeply meaningful.",
            },
            {
              title: "Personal at Every Step",
              description: "From selection to packaging and delivery, we handle every detail with intention.",
            },
            {
              title: "Made for Lasting Memories",
              description: "We craft moments your beloved will remember long after the gift is opened.",
            },
          ].map((point) => (
            <article key={point.title} className="luxury-card rounded-xl p-5">
              <h3 className="section-title text-xl">{point.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{point.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

