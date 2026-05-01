export default function ShippingReturnsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">DELIVERY INFO</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Shipping & Returns</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Here is simple information about delivery and returns.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="luxury-card rounded-xl p-5">
          <h2 className="section-title text-2xl">Shipping</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Nairobi: 1-2 business days.</li>
            <li>Outside Nairobi: 2-5 business days.</li>
            <li>Free delivery for orders above Ksh 7,000.</li>
            <li>Delivery fee applies to all orders.</li>
          </ul>
        </article>
        <article className="luxury-card rounded-xl p-5">
          <h2 className="section-title text-2xl">Returns</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Return request within 3 days after delivery.</li>
            <li>Item must be unused and in original package.</li>
            <li>Perfumes opened cannot be returned.</li>
            <li>Contact support first before sending item back.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

