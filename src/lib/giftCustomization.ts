export type GiftCustomizationDraft = {
  packagingStyle: string;
  message: string;
};

const GIFT_CUSTOMIZATION_KEY = "nuru_gift_customization_draft";

export function readGiftCustomizationDraft(): GiftCustomizationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GIFT_CUSTOMIZATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GiftCustomizationDraft>;
    if (typeof parsed.packagingStyle !== "string" || typeof parsed.message !== "string") return null;
    return { packagingStyle: parsed.packagingStyle, message: parsed.message };
  } catch {
    return null;
  }
}

export function writeGiftCustomizationDraft(draft: GiftCustomizationDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GIFT_CUSTOMIZATION_KEY, JSON.stringify(draft));
}

export function clearGiftCustomizationDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GIFT_CUSTOMIZATION_KEY);
}
