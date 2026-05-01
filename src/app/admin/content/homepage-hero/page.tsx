"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";
import { HeroImageUploader, type HeroImageToastTone } from "@/components/admin/HeroImageUploader";

const MAX_SLIDES = 6;

type HeroOverlay = {
  kicker: string;
  headline: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

const emptyOverlay = (): HeroOverlay => ({
  kicker: "",
  headline: "",
  subheading: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
});

export default function AdminHomepageHeroPage() {
  const [slideUrls, setSlideUrls] = useState<string[]>([]);
  const [effectiveUrls, setEffectiveUrls] = useState<string[]>([]);
  const [overlay, setOverlay] = useState<HeroOverlay>(() => emptyOverlay());
  const [effectiveOverlay, setEffectiveOverlay] = useState<HeroOverlay>(emptyOverlay());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<HeroImageToastTone>("info");

  const showToast = useCallback((msg: string, tone: HeroImageToastTone) => {
    setToastTone(tone);
    setMessage(msg);
  }, []);

  const load = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGetAuth<{
        imageUrls: string[];
        effectiveUrls: string[];
        overlay: HeroOverlay;
        effectiveOverlay: HeroOverlay;
      }>("/api/admin/homepage-hero", token);
      setEffectiveUrls(data.effectiveUrls ?? []);
      const stored = data.imageUrls ?? [];
      setSlideUrls(stored.length ? [...stored] : []);
      setOverlay(data.overlay ?? emptyOverlay());
      setEffectiveOverlay(data.effectiveOverlay ?? emptyOverlay());
      setMessage("");
    } catch {
      setMessage("Could not load homepage hero settings.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function setOverlayField<K extends keyof HeroOverlay>(key: K, value: HeroOverlay[K]) {
    setOverlay((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    const token = getAuthToken();
    if (!token) return;
    const trimmed = slideUrls.map((r) => r.trim()).filter(Boolean);
    setSaving(true);
    setMessage("");
    try {
      await apiPatchAuth(
        "/api/admin/homepage-hero",
        {
          imageUrls: trimmed,
          kicker: overlay.kicker,
          headline: overlay.headline,
          subheading: overlay.subheading,
          primaryCtaLabel: overlay.primaryCtaLabel,
          primaryCtaHref: overlay.primaryCtaHref,
          secondaryCtaLabel: overlay.secondaryCtaLabel,
          secondaryCtaHref: overlay.secondaryCtaHref,
        },
        token
      );
      setToastTone("success");
      setMessage("Homepage hero saved.");
      await load();
    } catch {
      setToastTone("error");
      setMessage(
        "Save failed. Check image URLs (https only, max six). Button links must start with / or be full http(s) URLs."
      );
    } finally {
      setSaving(false);
    }
  }

  async function clearToDefaults() {
    const token = getAuthToken();
    if (!token) return;
    setSaving(true);
    try {
      await apiPatchAuth("/api/admin/homepage-hero", { imageUrls: [] }, token);
      setToastTone("success");
      setMessage("Custom hero images cleared. Slideshow falls back to built-in stock photos.");
      await load();
    } catch {
      setToastTone("error");
      setMessage("Could not reset images.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-none space-y-6 py-10">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <Link href="/admin/content" className="text-xs text-gold hover:underline">
          ← Content
        </Link>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gold/70">Homepage</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Hero</h1>
        <p className="mt-2 text-sm text-muted">
          Edit the text and buttons over the hero, and manage background slides (upload or URL). Save to publish. Leave a
          text field empty to use the built-in default for that line.{" "}
          <span className="text-gold">Use defaults</span> only resets custom images, not wording.
        </p>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl border border-gold/20 bg-white/5" />
      ) : (
        <div className="luxury-card space-y-6 rounded-xl p-5">
          <div className="rounded-lg border border-gold/20 bg-black/25 p-4">
            <p className="text-xs text-gold">Live preview (defaults apply where you left fields empty)</p>
            <p className="mt-3 text-[10px] tracking-[0.25em] text-gold/90">{effectiveOverlay.kicker}</p>
            <p className="mt-2 font-serif text-xl text-foreground sm:text-2xl">{effectiveOverlay.headline}</p>
            <p className="mt-2 text-sm text-muted">{effectiveOverlay.subheading}</p>
            <p className="mt-3 text-xs text-muted">
              <span className="text-gold">{effectiveOverlay.primaryCtaLabel}</span> → {effectiveOverlay.primaryCtaHref} ·{" "}
              <span className="text-gold">{effectiveOverlay.secondaryCtaLabel}</span> →{" "}
              {effectiveOverlay.secondaryCtaHref}
            </p>
          </div>

          <div className="space-y-3 border-b border-gold/20 pb-6">
            <p className="text-xs uppercase tracking-[0.12em] text-gold/80">Text overlay</p>
            <label className="block text-xs text-muted">
              Eyebrow / kicker
              <input
                className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                value={overlay.kicker}
                onChange={(e) => setOverlayField("kicker", e.target.value)}
                placeholder="Leave empty for default"
              />
            </label>
            <label className="block text-xs text-muted">
              Headline
              <input
                className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                value={overlay.headline}
                onChange={(e) => setOverlayField("headline", e.target.value)}
                placeholder="Leave empty for default"
              />
            </label>
            <label className="block text-xs text-muted">
              Supporting text
              <textarea
                className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                rows={3}
                value={overlay.subheading}
                onChange={(e) => setOverlayField("subheading", e.target.value)}
                placeholder="Leave empty for default"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Primary button label
                <input
                  className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                  value={overlay.primaryCtaLabel}
                  onChange={(e) => setOverlayField("primaryCtaLabel", e.target.value)}
                />
              </label>
              <label className="block text-xs text-muted">
                Primary link (/shop or https://…)
                <input
                  className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                  value={overlay.primaryCtaHref}
                  onChange={(e) => setOverlayField("primaryCtaHref", e.target.value)}
                />
              </label>
              <label className="block text-xs text-muted">
                Secondary button label
                <input
                  className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                  value={overlay.secondaryCtaLabel}
                  onChange={(e) => setOverlayField("secondaryCtaLabel", e.target.value)}
                />
              </label>
              <label className="block text-xs text-muted">
                Secondary link
                <input
                  className="mt-1 w-full rounded border border-gold/40 bg-black px-3 py-2 text-sm"
                  value={overlay.secondaryCtaHref}
                  onChange={(e) => setOverlayField("secondaryCtaHref", e.target.value)}
                />
              </label>
            </div>
          </div>

          <div>
            <p className="text-xs text-gold">Slide image URLs (after save)</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {effectiveUrls.map((url, i) => (
                <li key={`${i}-${url}`} className="truncate" title={url}>
                  {i + 1}. {url}
                </li>
              ))}
            </ul>
          </div>

          <HeroImageUploader
            urls={slideUrls}
            onChange={setSlideUrls}
            max={MAX_SLIDES}
            disabled={saving}
            onToast={showToast}
          />

          <div className="flex flex-wrap gap-3 border-t border-gold/20 pt-4">
            <button
              type="button"
              disabled={saving}
              className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={saving}
              className="rounded-full border border-gold/40 px-5 py-2 text-sm text-gold disabled:opacity-50"
              onClick={() => void clearToDefaults()}
            >
              Use default images
            </button>
          </div>
        </div>
      )}

      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}
