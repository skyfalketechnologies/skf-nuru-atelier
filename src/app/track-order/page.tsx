import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Gift Order",
  description: "Track your NURU ATELIER order status quickly using your order ID.",
  keywords: ["track order Kenya", "gift order tracking Kenya", "best giftshop in Kenya"],
};

export default function TrackOrderPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">ORDER SUPPORT</p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Track Your Order</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Enter your order ID below to check your order progress.
        </p>
      </section>

      <section className="luxury-card rounded-2xl p-6">
        <form className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <input
            placeholder="Enter Order ID"
            className="rounded border border-gold/40 bg-black p-3 text-sm"
          />
          <button className="rounded-full bg-gold px-5 py-3 text-sm font-medium text-black">
            Check Status
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          If you need help, contact us at <span className="text-foreground">concierge@nuruatelier.com</span>.
        </p>
      </section>
    </main>
  );
}

