import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact NURU ATELIER",
  description:
    "Contact NURU ATELIER for product support, gift help, and store location details in Kakamega, Kenya.",
  keywords: [
    "Michaels Bouqute Kakamega",
    "best giftshop in Kenya",
    "Best Gift shop in Nairobi",
    "best gift shop in mombasa",
    "best gift shop in Nakuru",
  ],
};

export default function ContactPage() {
  const contactChannels = [
    {
      title: "Email Us",
      value: "shop@nuruatelier.com",
      note: "Best for order updates and detailed inquiries.",
    },
    {
      title: "WhatsApp",
      value: "014 101 0644",
      note: "Quick responses for urgent gifting support.",
    },
    {
      title: "Visit Store",
      value: "Kakamega CBD, Kenya",
      note: "Walk in for curated recommendations in person.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="luxury-card overflow-hidden rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.3em] text-gold">CONTACT</p>
        <h1 className="section-title mt-2 text-3xl sm:text-5xl">Let&apos;s Assist You Personally</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Reach out for product guidance, gift customization, delivery coordination, or after-purchase
          support. We are here to make every experience smooth and memorable.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {contactChannels.map((channel) => (
            <article key={channel.title} className="rounded-xl border border-gold/25 bg-black/30 p-4">
              <p className="text-xs tracking-[0.18em] text-gold">{channel.title}</p>
              <p className="mt-2 text-sm text-foreground">{channel.value}</p>
              <p className="mt-1 text-xs text-muted">{channel.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-[1.15fr_0.85fr]">
        <form className="luxury-card rounded-2xl p-6 sm:p-7">
          <p className="text-xs tracking-[0.2em] text-gold">SEND A MESSAGE</p>
          <h2 className="section-title mt-2 text-3xl">How can we help?</h2>
          <p className="mt-2 text-sm text-muted">
            Share your request and our team will get back to you as soon as possible.
          </p>
          <div className="mt-5 grid gap-4">
            <input className="rounded-md border border-gold/40 bg-black p-3 text-sm" placeholder="Full name" />
            <input className="rounded-md border border-gold/40 bg-black p-3 text-sm" placeholder="Email address" />
            <input className="rounded-md border border-gold/40 bg-black p-3 text-sm" placeholder="Phone (optional)" />
            <textarea
              className="rounded-md border border-gold/40 bg-black p-3 text-sm"
              rows={6}
              placeholder="Tell us what you need"
            />
            <button className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-black">
              Send Message
            </button>
          </div>
        </form>

        <div className="space-y-5">
          <aside className="luxury-card rounded-2xl p-6 sm:p-7">
            <p className="text-xs tracking-[0.2em] text-gold">SUPPORT HOURS</p>
            <h2 className="section-title mt-2 text-3xl">Customer Care Desk</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Mon - Sat: 8:30 AM - 8:30 PM EAT</li>
              <li>Sunday: By appointment</li>
              <li>Average response time: Within 1 hour on WhatsApp</li>
              <li>For urgent deliveries, contact us directly by phone.</li>
            </ul>
          </aside>
          <div className="luxury-card relative min-h-[220px] overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1400)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
            <div className="relative flex min-h-[220px] items-end p-5">
              <p className="text-sm text-neutral-100">Personalized support for every meaningful gift.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-card rounded-2xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-gold">OUR LOCATION</p>
            <h2 className="section-title mt-2 text-3xl">Find Us on Map</h2>
          </div>
          <a
            href="https://www.google.com/maps?rlz=1C1GCEA_enKE1121KE1121&gs_lcrp=EgZjaHJvbWUqCAgBEEUYJxg7MgYIABBFGDkyCAgBEEUYJxg7MgYIAhBFGDsyBwgDEAAYgAQyBwgEEAAYgAQyBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQgxOTk5ajBqN6gCALACAA&um=1&ie=UTF-8&fb=1&gl=ke&sa=X&geocode=Kfs9Bi_RPYAXMX6i9md_jchc&daddr=Kakamega"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gold hover:text-foreground"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-gold/25">
          <iframe
            title="NURU Atelier location map"
            src="https://www.google.com/maps?q=Kakamega&output=embed"
            className="h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">WHY REACH OUT</p>
          <h2 className="section-title mt-2 text-3xl">A support experience that feels premium</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Expert Gift Guidance",
              description: "Get personalized recommendations based on your occasion, style, and budget.",
            },
            {
              title: "Fast, Human Response",
              description: "Talk to a real team member who understands your request and acts quickly.",
            },
            {
              title: "Reliable Delivery Support",
              description: "Coordinate timing, packaging notes, and special instructions with confidence.",
            },
          ].map((item) => (
            <article key={item.title} className="luxury-card rounded-xl p-5">
              <h3 className="section-title text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

