import { apiGet } from "@/lib/api";
import GiftCustomizationBuilder from "@/components/GiftCustomizationBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Gift Packages in Kenya",
  description:
    "Build your own gift package with product options, packaging, and personal message for him or her.",
  keywords: [
    "best giftshop in Kenya",
    "Michaels Bouqute Kakamega",
    "Best Gift shop in Nairobi",
    "best gift shop in mombasa",
    "best gift shop in Nakuru",
  ],
};

type GiftOption = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  extraCostKes: number;
};

export default async function GiftCustomizationPage() {
  const data = await apiGet<{ giftOptions: GiftOption[] }>("/api/catalog/gift-options").catch(() => ({
    giftOptions: [],
  }));
  const packagingOptions = data.giftOptions.some((option) => option.code === "nuru_atelier_bag")
    ? data.giftOptions
    : [
        ...data.giftOptions,
        {
          _id: "nuru-atelier-bag",
          name: "Nuru Atelier Bag",
          code: "nuru_atelier_bag",
          description: "Premium branded Nuru Atelier gift bag.",
          extraCostKes:150,
        },
      ];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.3em] text-gold">GIFT CUSTOMIZATION</p>
        <h1 className="section-title mt-2 text-4xl sm:text-5xl">Gift Atelier</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Build your own gift package with simple options and a personal message.
        </p>
      </section>

      <GiftCustomizationBuilder packagingOptions={packagingOptions} />

      <section className="luxury-card overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
          <div>
            <p className="text-xs tracking-[0.25em] text-gold">GIFT PREVIEW</p>
            <h2 className="section-title mt-2 text-3xl">How Your Gift Will Look</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              Your gift will be packed neatly, wrapped well, and prepared with your custom message.
            </p>
          </div>
          <div
            className="h-56 rounded-xl bg-neutral-900 bg-cover bg-center sm:h-64"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80)",
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">HOW IT WORKS</p>
          <h2 className="section-title mt-2 text-3xl text-foreground">Create a gift that feels personal</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Choose your gift items",
              description: "Select fragrances, body care, and add-ons that match your beloved's style.",
            },
            {
              title: "Pick your packaging",
              description: "Choose from elegant wrapping and branded bag options for a refined presentation.",
            },
            {
              title: "Add your message",
              description: "Include a personalized note to make every gift memorable and heartfelt.",
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

