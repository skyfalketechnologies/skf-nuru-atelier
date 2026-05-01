"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import { trackAddToCart } from "@/lib/gtm-ecommerce";
import { writeGiftCustomizationDraft } from "@/lib/giftCustomization";

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

export type GiftAtelierPublicConfig = {
  forHer: { curated: CuratedGift[]; bodyCare: BodyCareType[] };
  forHim: { curated: CuratedGift[]; bodyCare: BodyCareType[] };
};

function minOptionPrice(options: { priceKes: number }[]): number {
  if (!options.length) return 0;
  return Math.min(...options.map((o) => o.priceKes));
}

export default function GiftCustomizationBuilder({
  packagingOptions,
  config,
}: {
  packagingOptions: PackagingOption[];
  config: GiftAtelierPublicConfig;
}) {
  const router = useRouter();
  const [recipient, setRecipient] = useState<RecipientProfile>("for_her");
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [selectedGiftOptions, setSelectedGiftOptions] = useState<Record<string, string>>({});
  const [selectedBodyCareTypes, setSelectedBodyCareTypes] = useState<string[]>([]);
  const [selectedBodyCareItems, setSelectedBodyCareItems] = useState<Record<string, string>>({});
  const [selectedPackagingCode, setSelectedPackagingCode] = useState<string>(packagingOptions[0]?.code ?? "");
  const [message, setMessage] = useState("");

  const recipientKey = recipient === "for_her" ? "forHer" : "forHim";
  const recipientOptions = config[recipientKey].curated;
  const recipientCareOptions = config[recipientKey].bodyCare;
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
    const firstId = gift?.options[0]?.id;
    if (gift && firstId && !selectedGiftOptions[id]) {
      setSelectedGiftOptions((prev) => ({ ...prev, [id]: firstId }));
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
    const firstItemId = type?.items[0]?.id;
    if (type && firstItemId && !selectedBodyCareItems[typeId]) {
      setSelectedBodyCareItems((prev) => ({ ...prev, [typeId]: firstItemId }));
    }
  }

  function setBodyCareItem(typeId: string, itemId: string) {
    setSelectedBodyCareItems((prev) => ({ ...prev, [typeId]: itemId }));
  }

  function proceedToCart() {
    const selectedGiftCount = selectedGifts.length;
    const selectedCareCount = selectedBodyCareTypes.length;
    const hasConfiguredItems = selectedGiftCount > 0 || selectedCareCount > 0 || (selectedPackaging?.extraCostKes ?? 0) > 0;

    if (hasConfiguredItems) {
      const packageName = `Custom Gift Package (${recipient === "for_her" ? "For Her" : "For Him"})`;
      const packageId = [
        "gift-custom",
        recipient,
        selectedPackagingCode || "standard",
        selectedGifts.slice().sort().join("-") || "no-gifts",
        selectedBodyCareTypes.slice().sort().join("-") || "no-care",
      ].join(":");

      const line = {
        productId: packageId,
        name: packageName,
        priceKes: Math.max(0, totalKes),
        quantity: 1,
      };
      addToCart(line);
      trackAddToCart(line, {
        listId: "gift_atelier",
        listName: "Gift customization",
        source: "gift_builder",
      });
    }

    writeGiftCustomizationDraft({
      packagingStyle: selectedPackagingCode,
      message,
    });
    router.push("/cart");
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
          {!recipientCareOptions.length ? (
            <p className="mt-4 text-sm text-muted">
              We are refreshing add-on options for this collection. Please check back soon, or contact us and we will
              help you build the perfect gift.
            </p>
          ) : null}
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
                    From Ksh {minOptionPrice(type.items).toLocaleString()}
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
                      value={selectedBodyCareItems[type.id] ?? type.items[0]?.id ?? ""}
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
          {!recipientOptions.length ? (
            <p className="mt-4 text-sm text-muted">
              Curated gift choices for this profile are being updated. Check back shortly, or reach out and our team will
              curate something special for you.
            </p>
          ) : null}
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
                    From Ksh {minOptionPrice(gift.options).toLocaleString()}
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
                      value={selectedGiftOptions[gift.id] ?? gift.options[0]?.id ?? ""}
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
                      (
                        {
                          gift.options.find(
                            (option) => option.id === (selectedGiftOptions[gift.id] ?? gift.options[0]?.id)
                          )?.label
                        }
                      )
                    </span>
                  </span>
                  <span className="text-gold">
                    Ksh{" "}
                    {(
                      gift.options.find(
                        (option) => option.id === (selectedGiftOptions[gift.id] ?? gift.options[0]?.id)
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
                const selectedItemId = selectedBodyCareItems[type.id] ?? type.items[0]?.id ?? "";
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
          <button
            type="button"
            onClick={proceedToCart}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-medium text-black hover:opacity-90"
          >
            Proceed to Cart
          </button>
        </div>
      </aside>
    </section>
  );
}

