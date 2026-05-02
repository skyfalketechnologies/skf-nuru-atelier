"use client";

import { ProductImageFrame } from "@/components/ProductImageFrame";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  images: string[];
  productName: string;
};

export function ProductDetailGallery({ images, productName }: Props) {
  const list = useMemo(
    () => images.filter((u) => typeof u === "string" && u.trim().length > 0),
    [images]
  );
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeIndex = list.length ? Math.min(Math.max(0, selected), list.length - 1) : 0;
  const current = list[safeIndex];

  useEffect(() => {
    if (selected >= list.length) setSelected(Math.max(0, list.length - 1));
  }, [list.length, selected]);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected((i) => (i - 1 + list.length) % list.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected((i) => (i + 1) % list.length);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, closeLightbox, list.length]);

  if (list.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl">
        <p className="text-sm text-muted">No product image</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative w-full overflow-hidden rounded-2xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            aria-label="Open full screen image viewer"
          >
            <ProductImageFrame
              src={current}
              alt={productName}
              priority
              className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-transparent"
            />
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-foreground/95 backdrop-blur-sm">
              Full screen
            </span>
          </button>
        </div>

        {list.length > 1 ? (
          <div className="grid w-full grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
            {list.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setSelected(i)}
                className={`overflow-hidden rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                  i === safeIndex ? "bg-gold/15" : "bg-transparent hover:bg-white/[0.04]"
                }`}
                aria-label={`Show product image ${i + 1} of ${list.length}`}
                aria-current={i === safeIndex ? "true" : undefined}
              >
                <ProductImageFrame
                  src={src}
                  alt={`${productName} — view ${i + 1}`}
                  className="flex aspect-square w-full items-center justify-center bg-transparent"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
          role="dialog"
          aria-modal
          aria-label="Product images full screen"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="min-w-0 truncate text-sm text-muted">{productName}</p>
            <button
              type="button"
              onClick={closeLightbox}
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm text-foreground hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-4 sm:px-6">
            {list.length > 1 ? (
              <button
                type="button"
                className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-2xl leading-none text-gold hover:bg-white/10 sm:left-4"
                onClick={() => setSelected((i) => (i - 1 + list.length) % list.length)}
                aria-label="Previous image"
              >
                ‹
              </button>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- full-screen viewer; remote URLs */}
            <img
              src={list[safeIndex]}
              alt={`${productName} — image ${safeIndex + 1}`}
              className="max-h-[min(82vh,calc(100vh-8rem))] max-w-[min(96vw,calc(100%-4rem))] object-contain sm:max-w-[calc(100%-8rem)]"
            />
            {list.length > 1 ? (
              <button
                type="button"
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-2xl leading-none text-gold hover:bg-white/10 sm:right-4"
                onClick={() => setSelected((i) => (i + 1) % list.length)}
                aria-label="Next image"
              >
                ›
              </button>
            ) : null}
          </div>
          {list.length > 1 ? (
            <p className="shrink-0 pb-4 text-center text-xs tabular-nums text-muted">
              {safeIndex + 1} / {list.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
