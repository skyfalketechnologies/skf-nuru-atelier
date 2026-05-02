import Link from "next/link";
import type { ShopFilterState } from "@/lib/shopSearchParams";
import { toShopUrl, withShopPage } from "@/lib/shopSearchParams";

function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let d = -1; d <= 1; d++) {
    const p = current + d;
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && prev !== undefined && p - prev > 1) out.push("gap");
    out.push(p);
  }
  return out;
}

const linkClass =
  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-gold/20 bg-black/30 px-3 text-sm text-foreground transition hover:border-gold/40 hover:bg-gold/5";
const activeClass =
  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-gold/50 bg-gold/10 px-3 text-sm font-medium text-gold";
const disabledClass =
  "inline-flex min-h-10 min-w-10 cursor-not-allowed items-center justify-center rounded-lg border border-gold/10 bg-black/20 px-3 text-sm text-muted opacity-50";

type Props = {
  state: ShopFilterState;
  totalPages: number;
};

export function ShopPagination({ state, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const current = Math.min(state.page, totalPages);
  const prev = current > 1 ? withShopPage(state, current - 1) : null;
  const next = current < totalPages ? withShopPage(state, current + 1) : null;
  const nums = pageNumbers(current, totalPages);

  return (
    <nav
      className="flex flex-col items-center gap-4 border-t border-gold/15 pt-8 sm:flex-row sm:justify-between"
      aria-label="Catalog pagination"
    >
      <p className="order-2 text-xs text-muted sm:order-1">
        Page <span className="tabular-nums text-foreground">{current}</span> of{" "}
        <span className="tabular-nums text-foreground">{totalPages}</span>
      </p>
      <div className="order-1 flex flex-wrap items-center justify-center gap-1 sm:order-2">
        {prev ? (
          <Link href={toShopUrl(prev)} className={linkClass} prefetch={false}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}
        {nums.map((item, idx) =>
          item === "gap" ? (
            <span key={`gap-${idx}`} className="px-1 text-muted">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={toShopUrl(withShopPage(state, item))}
              className={item === current ? activeClass : linkClass}
              prefetch={false}
              aria-current={item === current ? "page" : undefined}
            >
              {item}
            </Link>
          )
        )}
        {next ? (
          <Link href={toShopUrl(next)} className={linkClass} prefetch={false}>
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </nav>
  );
}
