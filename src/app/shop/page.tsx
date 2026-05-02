import Link from "next/link";
import { GtmShopListingView } from "@/components/GtmShopListingView";
import { ProductGridCard } from "@/components/ProductGridCard";
import { ShopFilterForm } from "@/components/shop/ShopFilterForm";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { apiGet } from "@/lib/api";
import { parseShopSearchParams, resetPage, toCatalogApiQuery, toShopUrl, type ShopFilterState } from "@/lib/shopSearchParams";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Shop and Perfume Store in Kenya",
  description:
    "Browse products by brand, category, and men or women. Shop gifts and perfumes in Kenya with delivery support.",
  keywords: [
    "best giftshop in Kenya",
    "Best Gift shop in Nairobi",
    "best gift shop in mombasa",
    "best gift shop in Nakuru",
    "Perfumes stores in Kenya",
  ],
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  images: string[];
  stock?: number;
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string };
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Brand = {
  _id: string;
  name: string;
  slug: string;
};

type CatalogResponse = {
  products: Product[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

function ActiveFilterChips({
  state,
  categories,
  brands,
}: {
  state: ShopFilterState;
  categories: Category[];
  brands: Brand[];
}) {
  type Chip = { label: string; href: string };
  const chips: Chip[] = [];

  if (state.search.trim()) {
    chips.push({
      label: `“${state.search.trim()}”`,
      href: toShopUrl(resetPage({ ...state, search: "" })),
    });
  }
  if (state.category) {
    const name = categories.find((c) => c.slug === state.category)?.name ?? state.category;
    chips.push({
      label: name,
      href: toShopUrl(resetPage({ ...state, category: "" })),
    });
  }
  if (state.brand) {
    const name = brands.find((b) => b.slug === state.brand)?.name ?? state.brand;
    chips.push({
      label: name,
      href: toShopUrl(resetPage({ ...state, brand: "" })),
    });
  }
  if (state.audience && state.audience !== "all") {
    const label = state.audience.charAt(0).toUpperCase() + state.audience.slice(1);
    chips.push({
      label,
      href: toShopUrl(resetPage({ ...state, audience: "all" })),
    });
  }
  if (state.minPrice) {
    chips.push({
      label: `Min Ksh ${Number(state.minPrice).toLocaleString()}`,
      href: toShopUrl(resetPage({ ...state, minPrice: "" })),
    });
  }
  if (state.maxPrice) {
    chips.push({
      label: `Max Ksh ${Number(state.maxPrice).toLocaleString()}`,
      href: toShopUrl(resetPage({ ...state, maxPrice: "" })),
    });
  }
  if (state.sort !== "newest") {
    const sortLabels: Record<string, string> = {
      popular: "Popular",
      price_asc: "Price ↑",
      price_desc: "Price ↓",
    };
    chips.push({
      label: sortLabels[state.sort] ?? state.sort,
      href: toShopUrl(resetPage({ ...state, sort: "newest" })),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">Active:</span>
      {chips.map((c, idx) => (
        <Link
          key={`${idx}-${c.href}`}
          href={c.href}
          className="group inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs text-foreground transition hover:border-gold/50 hover:bg-gold/10"
        >
          {c.label}
          <span className="text-gold/80 group-hover:text-gold" aria-hidden>
            ×
          </span>
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link href="/shop" className="text-xs text-muted underline decoration-gold/30 underline-offset-2 hover:text-gold">
        Clear all
      </Link>
    </div>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const state = parseShopSearchParams(raw);
  const catalogQuery = toCatalogApiQuery(state);

  const [productsPayload, categoriesData, brandsData] = await Promise.all([
    apiGet<CatalogResponse>(`/api/catalog/products?${catalogQuery.toString()}`).catch(() => ({
      products: [] as Product[],
      pagination: { page: 1, limit: state.limit, total: 0, pages: 0 },
    })),
    apiGet<{ categories: Category[] }>("/api/catalog/categories").catch(() => ({ categories: [] as Category[] })),
    apiGet<{ brands: Brand[] }>("/api/catalog/brands").catch(() => ({ brands: [] as Brand[] })),
  ]);

  const filteredProducts = productsPayload.products;
  const pagination = productsPayload.pagination ?? {
    page: state.page,
    limit: state.limit,
    total: filteredProducts.length,
    pages: 1,
  };
  const total = pagination.total;
  const totalPages = Math.max(1, pagination.pages || 1);
  const effectivePage = Math.min(Math.max(1, state.page), totalPages);
  const showingFrom = total === 0 ? 0 : (effectivePage - 1) * state.limit + 1;
  const showingTo = Math.min(effectivePage * state.limit, total);

  const catalogListId = `shop:${catalogQuery.toString()}`;
  const catalogListName = "Product catalog";

  const formValues = {
    search: state.search,
    category: state.category,
    brand: state.brand,
    audience: state.audience,
    sort: state.sort,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    limit: state.limit,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(197,164,109,0.12),transparent_55%)]">
      <GtmShopListingView products={filteredProducts} listId={catalogListId} listName={catalogListName} />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-black/60 via-black/40 to-black/25 px-6 py-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-gold/5 blur-2xl" />
          <p className="text-[11px] font-medium tracking-[0.35em] text-gold/90">SHOP AT NURU</p>
          <h1 className="section-title mt-3 max-w-3xl text-3xl text-foreground sm:text-4xl md:text-[2.75rem] md:leading-tight">
            Curated gifts & fragrance
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
           Every piece is chosen for quality and presentation, delivery and gifting available across Kenya.
          </p>
        </header>

        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,300px)_1fr] xl:gap-12">
          <aside className="mb-8 lg:sticky lg:top-24 lg:mb-0">
            <div className="hidden lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/80">Refine</p>
              <div className="mt-4 rounded-2xl border border-gold/20 bg-black/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <ShopFilterForm
                  categories={categoriesData.categories}
                  brands={brandsData.brands}
                  values={formValues}
                  idPrefix="desk"
                />
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-xs text-muted underline decoration-gold/25 underline-offset-2 hover:text-gold"
                >
                  Reset all filters
                </Link>
              </div>
            </div>

            <details className="group rounded-2xl border border-gold/20 bg-black/35 backdrop-blur-sm lg:hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-medium text-foreground">
                <span className="tracking-wide">Filters & sort</span>
                <span className="rounded-full border border-gold/25 px-3 py-1 text-xs text-gold/90">
                  <span className="group-open:hidden">Show</span>
                  <span className="hidden group-open:inline">Hide</span>
                </span>
              </summary>
              <div className="border-t border-gold/10 px-4 pb-5 pt-2">
                <ShopFilterForm
                  categories={categoriesData.categories}
                  brands={brandsData.brands}
                  values={formValues}
                  idPrefix="mob"
                />
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-xs text-muted underline decoration-gold/25 underline-offset-2 hover:text-gold"
                >
                  Reset all filters
                </Link>
              </div>
            </details>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-black/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-medium tabular-nums text-gold">{total.toLocaleString()}</span>{" "}
                  <span className="text-muted">
                    {total === 1 ? "product" : "products"}
                    {total > 0 ? (
                      <>
                        {" "}
                        <span className="text-muted/80">·</span> showing{" "}
                        <span className="tabular-nums text-foreground">
                          {showingFrom}-{showingTo}
                        </span>
                      </>
                    ) : null}
                  </span>
                </p>
                <div className="mt-3">
                  <ActiveFilterChips state={state} categories={categoriesData.categories} brands={brandsData.brands} />
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-gold/20 bg-black/30 px-8 py-16 text-center">
                <p className="font-serif text-xl text-foreground">No products match these filters</p>
                <p className="mt-2 text-sm text-muted">Try widening the price range or clearing a filter.</p>
                <Link
                  href="/shop"
                  className="mt-6 inline-flex rounded-full border border-gold/40 px-6 py-2.5 text-sm font-medium text-gold hover:bg-gold/10"
                >
                  View full catalog
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredProducts.map((product, index) => (
                    <ProductGridCard
                      key={product._id}
                      product={product}
                      gtm={{ listId: catalogListId, listName: catalogListName, index: index + 1 }}
                      listIdForCart={catalogListId}
                      listNameForCart={catalogListName}
                      source="shop_grid"
                    />
                  ))}
                </div>
                <ShopPagination state={{ ...state, page: effectivePage }} totalPages={totalPages} />
              </>
            )}
          </div>
        </div>

        <section className="mt-20 space-y-6 border-t border-gold/10 pt-16">
          <div>
            <p className="text-[11px] font-medium tracking-[0.28em] text-gold/80">OUR SERVICES</p>
            <h2 className="section-title mt-2 text-2xl text-foreground sm:text-3xl">Why customers shop with Nuru</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Complimentary Gift Wrapping",
                description: "Add a polished finishing touch with elegant wrap options on qualifying orders.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M20 12v8H4v-8M2 7h20v5H2z" />
                    <path d="M12 7v13M12 7h-1.5a2.5 2.5 0 1 1 0-5C12 2 12 4 12 7Zm0 0h1.5a2.5 2.5 0 1 0 0-5C12 2 12 4 12 7Z" />
                  </svg>
                ),
              },
              {
                title: "Swift Nairobi Delivery",
                description: "Enjoy same-day or next-day city delivery so your gift arrives right on time.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                  </svg>
                ),
              },
              {
                title: "Responsive Support",
                description: "Get quick product guidance, order updates, and help whenever you need it.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M4 5h16v10H7l-3 3z" />
                    <path d="M8 9h8M8 12h5" />
                  </svg>
                ),
              },
            ].map((item) => (
              <article key={item.title} className="luxury-card rounded-xl p-5">
                <div className="inline-flex rounded-full border border-gold/40 bg-black/50 p-2 text-gold">{item.icon}</div>
                <h3 className="section-title mt-4 text-xl sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
