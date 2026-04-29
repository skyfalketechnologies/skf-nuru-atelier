export default function HelpCenterPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">WE ARE HERE TO HELP</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Help Center</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Common questions with quick answers.
        </p>
      </section>

      <section className="space-y-4">
        {[
          {
            q: "How do I place an order?",
            a: "Choose products, add to cart, then finish checkout with M-Pesa.",
          },
          {
            q: "Can I pay on delivery?",
            a: "For now, payments are through M-Pesa only.",
          },
          {
            q: "How do I contact support?",
            a: "Email concierge@nuruatelier.com or use WhatsApp +254 700 000 000.",
          },
          {
            q: "Can I customize gift packaging?",
            a: "Yes, go to Gift Atelier and choose the options you want.",
          },
        ].map((item) => (
          <article key={item.q} className="luxury-card rounded-xl p-5">
            <h2 className="text-base text-foreground">{item.q}</h2>
            <p className="mt-2 text-sm text-muted">{item.a}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

