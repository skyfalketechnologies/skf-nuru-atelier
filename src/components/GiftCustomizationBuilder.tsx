"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PackagingOption = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  extraCostKes: number;
};

type RecipientProfile = "for_her" | "for_him";

type CuratedGift = {
  id: string;
  name: string;
  description: string;
  options: {
    id: string;
    label: string;
    priceKes: number;
  }[];
};

type BodyCareType = {
  id: string;
  label: string;
  items: {
    id: string;
    label: string;
    priceKes: number;
  }[];
};

const curatedGifts: Record<RecipientProfile, CuratedGift[]> = {
  for_her: [
    {
      id: "bouquet",
      name: "Flower Bouquet",
      description: "Premium seasonal bouquet.",
      options: [
        { id: "bouquet-classic", label: "Classic Bouquet", priceKes: 500 },
        { id: "bouquet-signature", label: "Signature Bouquet", priceKes: 1500 },
        { id: "bouquet-luxe", label: "Luxe Grand Bouquet", priceKes: 2800 },
      ],
    },
    {
      id: "chocolate",
      name: "Artisan Chocolate Box",
      description: "Luxury handcrafted chocolates.",
      options: [
        { id: "choco-small", label: "Small Box", priceKes: 700 },
        { id: "choco-medium", label: "Medium Box", priceKes: 1300 },
        { id: "choco-premium", label: "Premium Box", priceKes: 2200 },
      ],
    },
    {
      id: "scented-candle",
      name: "Scented Candle",
      description: "Soft amber signature candle.",
      options: [
        { id: "candle-mini", label: "Mini Candle", priceKes: 900 },
        { id: "candle-standard", label: "Standard Candle", priceKes: 1600 },
        { id: "candle-luxe", label: "Luxe Candle Set", priceKes: 2600 },
      ],
    },
    {
      id: "silk-note",
      name: "Silk Gift Card",
      description: "Personalized printed silk card.",
      options: [
        { id: "silk-note-standard", label: "Standard Print", priceKes: 400 },
        { id: "silk-note-premium", label: "Premium Foil Print", priceKes: 900 },
      ],
    },
  ],
  for_him: [
    {
      id: "leather-wallet",
      name: "Leather Wallet",
      description: "Classic black leather wallet.",
      options: [
        { id: "wallet-classic", label: "Classic", priceKes: 2200 },
        { id: "wallet-signature", label: "Signature", priceKes: 4200 },
        { id: "wallet-luxe", label: "Luxe Edition", priceKes: 6200 },
      ],
    },
    {
      id: "grooming-kit",
      name: "Grooming Kit",
      description: "Premium men's grooming essentials.",
      options: [
        { id: "grooming-core", label: "Core Kit", priceKes: 1800 },
        { id: "grooming-complete", label: "Complete Kit", priceKes: 3600 },
        { id: "grooming-atelier", label: "Atelier Kit", priceKes: 5200 },
      ],
    },
    {
      id: "dark-chocolate",
      name: "Dark Chocolate Collection",
      description: "Rich cocoa gift box.",
      options: [
        { id: "dark-choco-small", label: "Small Box", priceKes: 600 },
        { id: "dark-choco-medium", label: "Medium Box", priceKes: 1200 },
        { id: "dark-choco-grand", label: "Grand Box", priceKes: 2000 },
      ],
    },
    {
      id: "signature-card",
      name: "Signature Gift Card",
      description: "Personalized premium card.",
      options: [
        { id: "card-standard", label: "Standard Card", priceKes: 300 },
        { id: "card-signature", label: "Signature Card", priceKes: 900 },
      ],
    },
  ],
};

const forHerBodyCareOptions: BodyCareType[] = [
  {
    id: "perfume",
    label: "Perfume",
    items: [
      { id: "michaels-50-white-1", label: "Michaels Perfume 50ml - White #1", priceKes: 3200 },
      { id: "michaels-50-white-2", label: "Michaels Perfume 50ml - White #2", priceKes: 3200 },
      { id: "michaels-50-pink-2", label: "Michaels Perfume 50ml - Pink #2", priceKes: 3400 },
    ],
  },
  {
    id: "lotion",
    label: "Body Lotion",
    items: [
      { id: "ivory-silk-lotion", label: "Ivory Silk Lotion 250ml", priceKes: 1800 },
      { id: "rose-velvet-lotion", label: "Rose Velvet Lotion 250ml", priceKes: 1900 },
      { id: "amber-night-lotion", label: "Amber Night Lotion 250ml", priceKes: 2100 },
    ],
  },
  {
    id: "body-oil",
    label: "Tissue Body Oil",
    items: [
      { id: "golden-argan-oil", label: "Golden Argan Tissue Oil 100ml", priceKes: 1600 },
      { id: "noir-velvet-oil", label: "Noir Velvet Tissue Oil 100ml", priceKes: 1750 },
    ],
  },
];

const forHimCareOptions: BodyCareType[] = [
  {
    id: "belt",
    label: "Leather Belt",
    items: [
      { id: "belt-classic-black", label: "Classic Black Belt", priceKes: 1800 },
      { id: "belt-signature-brown", label: "Signature Brown Belt", priceKes: 2600 },
      { id: "belt-luxe-dual", label: "Luxe Dual-Tone Belt", priceKes: 3800 },
    ],
  },
  {
    id: "watch",
    label: "Watch",
    items: [
      { id: "watch-silver", label: "Silver Dial Watch", priceKes: 5200 },
      { id: "watch-noir", label: "Noir Chronograph Watch", priceKes: 7900 },
      { id: "watch-gold", label: "Gold Accent Watch", priceKes: 9800 },
    ],
  },
  {
    id: "bracelet",
    label: "Bracelet",
    items: [
      { id: "bracelet-steel", label: "Steel Link Bracelet", priceKes: 1500 },
      { id: "bracelet-leather", label: "Leather Wrap Bracelet", priceKes: 2100 },
      { id: "bracelet-obsidian", label: "Obsidian Bead Bracelet", priceKes: 2800 },
    ],
  },
  {
    id: "fragrance",
    label: "Men's Fragrance",
    items: [
      { id: "fragrance-noir-50", label: "Noir Essence 50ml", priceKes: 3200 },
      { id: "fragrance-noir-100", label: "Noir Essence 100ml", priceKes: 5600 },
      { id: "fragrance-oud-100", label: "Oud Signature 100ml", priceKes: 6400 },
    ],
  },
];

export default function GiftCustomizationBuilder({ packagingOptions }: { packagingOptions: PackagingOption[] }) {
  const [recipient, setRecipient] = useState<RecipientProfile>("for_her");
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [selectedGiftOptions, setSelectedGiftOptions] = useState<Record<string, string>>({});
  const [selectedBodyCareTypes, setSelectedBodyCareTypes] = useState<string[]>([]);
  const [selectedBodyCareItems, setSelectedBodyCareItems] = useState<Record<string, string>>({});
  const [selectedPackagingCode, setSelectedPackagingCode] = useState<string>(packagingOptions[0]?.code ?? "");
  const [message, setMessage] = useState("");

  const recipientOptions = curatedGifts[recipient];
  const recipientCareOptions = recipient === "for_her" ? forHerBodyCareOptions : forHimCareOptions;
  const selectedPackaging = packagingOptions.find((option) => option.code === selectedPackagingCode);

  const giftsTotal = useMemo(
    () =>
      recipientOptions
        .filter((gift) => selectedGifts.includes(gift.id))
        .reduce((sum, gift) => {
          const selectedOptionId = selectedGiftOptions[gift.id] ?? gift.options[0]?.id;
          const selectedOption = gift.options.find((option) => option.id === selectedOptionId);
          return sum + (selectedOption?.priceKes ?? 0);
        }, 0),
    [recipientOptions, selectedGifts, selectedGiftOptions]
  );
  const bodyCareTotal = useMemo(() => {
    return recipientCareOptions
      .filter((type) => selectedBodyCareTypes.includes(type.id))
      .reduce((sum, type) => {
        const selectedItemId = selectedBodyCareItems[type.id] ?? type.items[0]?.id;
        const selectedItem = type.items.find((item) => item.id === selectedItemId);
        return sum + (selectedItem?.priceKes ?? 0);
      }, 0);
  }, [recipientCareOptions, selectedBodyCareItems, selectedBodyCareTypes]);

  const totalKes = giftsTotal + bodyCareTotal + (selectedPackaging?.extraCostKes ?? 0);

  function toggleGift(id: string) {
    setSelectedGifts((prev) => {
      if (prev.includes(id)) return prev.filter((giftId) => giftId !== id);
      return [...prev, id];
    });
    const gift = recipientOptions.find((item) => item.id === id);
    if (gift && !selectedGiftOptions[id]) {
      setSelectedGiftOptions((prev) => ({ ...prev, [id]: gift.options[0].id }));
    }
  }

  function onRecipientChange(next: RecipientProfile) {
    setRecipient(next);
    setSelectedGifts([]);
    setSelectedGiftOptions({});
    setSelectedBodyCareTypes([]);
    setSelectedBodyCareItems({});
  }

  function setGiftOption(giftId: string, optionId: string) {
    setSelectedGiftOptions((prev) => ({ ...prev, [giftId]: optionId }));
  }

  function toggleBodyCareType(typeId: string) {
    setSelectedBodyCareTypes((prev) => {
      if (prev.includes(typeId)) return prev.filter((id) => id !== typeId);
      return [...prev, typeId];
    });
    const type = recipientCareOptions.find((item) => item.id === typeId);
    if (type && !selectedBodyCareItems[typeId]) {
      setSelectedBodyCareItems((prev) => ({ ...prev, [typeId]: type.items[0].id }));
    }
  }

  function setBodyCareItem(typeId: string, itemId: string) {
    setSelectedBodyCareItems((prev) => ({ ...prev, [typeId]: itemId }));
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-5">
        <div className="luxury-card rounded-xl p-5">
          <h2 className="text-sm tracking-[0.2em] text-gold">BELOVED</h2>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => onRecipientChange("for_her")}
              className={`rounded-full px-5 py-2 text-sm ${recipient === "for_her" ? "bg-gold text-black" : "gold-border text-gold hover:bg-gold/10"}`}
            >
              For Her
            </button>
            <button
              type="button"
              onClick={() => onRecipientChange("for_him")}
              className={`rounded-full px-5 py-2 text-sm ${recipient === "for_him" ? "bg-gold text-black" : "gold-border text-gold hover:bg-gold/10"}`}
            >
              For Him
            </button>
          </div>
        </div>

        <div className="luxury-card rounded-xl p-5">
          <h2 className="text-sm tracking-[0.2em] text-gold">
            {recipient === "for_her" ? "BODY CARE SELECTION" : "ACCESSORIES & FRAGRANCE"}
          </h2>
          <p className="mt-2 text-xs text-muted">
            {recipient === "for_her"
              ? "Add premium body care products and choose exact variants."
              : "Add premium accessories and fragrance variants."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recipientCareOptions.map((type) => {
              const isSelected = selectedBodyCareTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleBodyCareType(type.id)}
                  className={`rounded-lg border p-4 text-left ${isSelected ? "border-gold bg-gold/10" : "border-gold/30 hover:border-gold/60"}`}
                >
                  <p className="text-sm text-foreground">{type.label}</p>
                  <p className="mt-1 text-xs text-muted">
                    From Ksh {Math.min(...type.items.map((item) => item.priceKes)).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedBodyCareTypes.length ? (
            <div className="mt-4 space-y-3 border-t border-gold/20 pt-4">
              <p className="text-xs tracking-[0.18em] text-gold">
                {recipient === "for_her" ? "CHOSEN BODY CARE VARIANTS" : "CHOSEN ACCESSORY VARIANTS"}
              </p>
              {recipientCareOptions
                .filter((type) => selectedBodyCareTypes.includes(type.id))
                .map((type) => (
                  <div key={`${type.id}-variant`} className="grid gap-2 sm:grid-cols-[1fr_230px] sm:items-center">
                    <p className="text-sm text-muted">{type.label}</p>
                    <select
                      className="rounded-md border border-gold/40 bg-black p-2 text-sm"
                      value={selectedBodyCareItems[type.id] ?? type.items[0].id}
                      onChange={(e) => setBodyCareItem(type.id, e.target.value)}
                    >
                      {type.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label} (Ksh {item.priceKes.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          ) : null}
        </div>

        <div className="luxury-card rounded-xl p-5">
          <h2 className="text-sm tracking-[0.2em] text-gold">CHOOSE GIFTS</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recipientOptions.map((gift) => {
              const isSelected = selectedGifts.includes(gift.id);
              return (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => toggleGift(gift.id)}
                  className={`rounded-lg border p-4 text-left ${isSelected ? "border-gold bg-gold/10" : "border-gold/30 hover:border-gold/60"}`}
                >
                  <p className="text-sm text-foreground">{gift.name}</p>
                  <p className="mt-1 text-xs text-muted">{gift.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    From Ksh {Math.min(...gift.options.map((option) => option.priceKes)).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedGifts.length ? (
            <div className="mt-4 space-y-3 border-t border-gold/20 pt-4">
              <p className="text-xs tracking-[0.18em] text-gold">CHOSEN GIFT OPTIONS</p>
              {recipientOptions
                .filter((gift) => selectedGifts.includes(gift.id))
                .map((gift) => (
                  <div key={`${gift.id}-option`} className="grid gap-2 sm:grid-cols-[1fr_180px] sm:items-center">
                    <p className="text-sm text-muted">{gift.name}</p>
                    <select
                      className="rounded-md border border-gold/40 bg-black p-2 text-sm"
                      value={selectedGiftOptions[gift.id] ?? gift.options[0].id}
                      onChange={(e) => setGiftOption(gift.id, e.target.value)}
                    >
                      {gift.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} (Ksh {option.priceKes.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          ) : null}
        </div>

        <div className="luxury-card rounded-xl p-5">
          <h2 className="text-sm tracking-[0.2em] text-gold">PACKAGING STYLE</h2>
          <select
            className="mt-3 w-full rounded-md border border-gold/40 bg-black p-3 text-sm"
            value={selectedPackagingCode}
            onChange={(e) => setSelectedPackagingCode(e.target.value)}
          >
            {packagingOptions.map((option) => (
              <option key={option._id} value={option.code}>
                {option.name} (+Ksh {option.extraCostKes.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="luxury-card rounded-xl p-5">
          <h2 className="text-sm tracking-[0.2em] text-gold">CUSTOM MESSAGE</h2>
          <textarea
            className="mt-3 w-full rounded-md border border-gold/40 bg-black p-3 text-sm"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your personal note..."
          />
        </div>
      </div>

      <aside className="luxury-card h-fit rounded-xl p-5">
        <h2 className="text-sm tracking-[0.2em] text-gold">YOUR GIFT SUMMARY</h2>
        <p className="mt-3 text-sm text-muted">Beloved: {recipient === "for_her" ? "For Her" : "For Him"}</p>
        <div className="mt-4 space-y-2">
          {selectedGifts.length ? (
            recipientOptions
              .filter((gift) => selectedGifts.includes(gift.id))
              .map((gift) => (
                <div key={gift.id} className="flex items-center justify-between text-sm">
                  <span>
                    {gift.name}
                    <span className="ml-1 text-xs text-muted">
                      ({gift.options.find((option) => option.id === (selectedGiftOptions[gift.id] ?? gift.options[0].id))?.label})
                    </span>
                  </span>
                  <span className="text-gold">
                    Ksh{" "}
                    {(
                      gift.options.find(
                        (option) => option.id === (selectedGiftOptions[gift.id] ?? gift.options[0].id)
                      )?.priceKes ?? 0
                    ).toLocaleString()}
                  </span>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted">No gifts selected yet.</p>
          )}
        </div>
        <div className="mt-4 space-y-2 border-t border-gold/20 pt-3">
          <p className="text-xs tracking-[0.18em] text-gold">
            {recipient === "for_her" ? "BODY CARE" : "ACCESSORIES & FRAGRANCE"}
          </p>
          {selectedBodyCareTypes.length ? (
            recipientCareOptions
              .filter((type) => selectedBodyCareTypes.includes(type.id))
              .map((type) => {
                const selectedItemId = selectedBodyCareItems[type.id] ?? type.items[0].id;
                const selectedItem = type.items.find((item) => item.id === selectedItemId);
                return (
                  <div key={`${type.id}-summary`} className="flex items-center justify-between text-sm">
                    <span>{selectedItem?.label}</span>
                    <span className="text-gold">Ksh {(selectedItem?.priceKes ?? 0).toLocaleString()}</span>
                  </div>
                );
              })
          ) : (
            <p className="text-sm text-muted">
              {recipient === "for_her" ? "No body care item selected yet." : "No accessory selected yet."}
            </p>
          )}
        </div>
        <div className="mt-4 border-t border-gold/20 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Packaging</span>
            <span className="text-gold">
              Ksh {(selectedPackaging?.extraCostKes ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-base">
            <span>Total</span>
            <span className="text-gold">Ksh {totalKes.toLocaleString()}</span>
          </div>
          <Link
            href="/cart"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-medium text-black hover:opacity-90"
          >
            Proceed to Cart
          </Link>
        </div>
      </aside>
    </section>
  );
}

