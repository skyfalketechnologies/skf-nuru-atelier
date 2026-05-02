"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductGridCard } from "@/components/ProductGridCard";
import type { ProductGridCardProduct } from "@/components/ProductGridCard";

type Props = { products: ProductGridCardProduct[] };

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function FeaturedProductsCarousel({ products }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanPrev(scrollLeft > 2);
    setCanNext(scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateArrows);
    };
  }, [products, updateArrows]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(240, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const navBtnClass =
    "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-background/90 text-gold shadow-[0_4px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:border-gold/45 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="relative w-full">
      <button
        type="button"
        className={`${navBtnClass} absolute left-1 top-1/2 z-10 -translate-y-1/2 sm:left-2`}
        aria-label="Scroll featured products left"
        disabled={!canPrev}
        onClick={() => scrollByDir(-1)}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        className={`${navBtnClass} absolute right-1 top-1/2 z-10 -translate-y-1/2 sm:right-2`}
        aria-label="Scroll featured products right"
        disabled={!canNext}
        onClick={() => scrollByDir(1)}
      >
        <ChevronRight />
      </button>
      <div
        ref={scrollerRef}
        className="featured-carousel-track w-full overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth snap-x snap-mandatory"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollByDir(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollByDir(1);
          }
        }}
      >
        <div className="flex w-max gap-4 sm:gap-5">
          {products.map((product) => (
            <div
              key={product._id}
              className="w-[min(260px,calc(50vw-1.25rem))] shrink-0 snap-start sm:w-[260px]"
            >
              <ProductGridCard
                product={product}
                listIdForCart="home_featured"
                listNameForCart="Featured products"
                source="home_featured"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
