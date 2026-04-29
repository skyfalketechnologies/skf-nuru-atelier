import Link from "next/link";
import { apiGet } from "@/lib/api";
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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (typeof params.search === "string") query.set("search", params.search);
  if (typeof params.sort === "string") query.set("sort", params.sort);
  if (typeof params.category === "string") query.set("category", params.category);
  if (typeof params.brand === "string") query.set("brand", params.brand);
  if (typeof params.audience === "string" && params.audience !== "all") query.set("audience", params.audience);
  if (!query.get("sort")) query.set("sort", "newest");

  const [productsData, categoriesData, brandsData] = await Promise.all([
    apiGet<{ products: Product[] }>(`/api/catalog/products?${query.toString()}`).catch(() => ({
      products: [],
    })),
    apiGet<{ categories: Category[] }>("/api/catalog/categories").catch(() => ({ categories: [] })),
    apiGet<{ brands: Brand[] }>("/api/catalog/brands").catch(() => ({ brands: [] })),
  ]);
  const filteredProducts = productsData.products;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <section className="luxury-card rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">PRODUCT CATALOG</p>
        <h1 className="section-title mt-2 text-3xl text-foreground sm:text-4xl">Our Products Collection</h1>
        <p className="mt-2 text-sm text-muted">Fragrance, Body Care, and Gift Shopping Made Easy</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <form className="luxury-card h-fit space-y-4 rounded-xl p-5">
          <h2 className="text-sm tracking-[0.2em] text-gold">FILTERS</h2>
          <input
            name="search"
            defaultValue={typeof params.search === "string" ? params.search : ""}
            placeholder="Search perfumes, jewelry, gift sets..."
            className="w-full rounded border border-gold/40 bg-black p-3 text-sm"
          />
          <select
            name="category"
            defaultValue={typeof params.category === "string" ? params.category : ""}
            className="w-full rounded border border-gold/40 bg-black p-3 text-sm"
          >
            <option value="">All Categories</option>
            {categoriesData.categories.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="brand"
            defaultValue={typeof params.brand === "string" ? params.brand : ""}
            className="w-full rounded border border-gold/40 bg-black p-3 text-sm"
          >
            <option value="">All Brands</option>
            {brandsData.brands.map((brand) => (
              <option key={brand._id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            name="audience"
            defaultValue={typeof params.audience === "string" ? params.audience : "all"}
            className="w-full rounded border border-gold/40 bg-black p-3 text-sm"
          >
            <option value="all">All</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>
          <select
            name="sort"
            defaultValue={typeof params.sort === "string" ? params.sort : "newest"}
            className="w-full rounded border border-gold/40 bg-black p-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button className="w-full rounded-full bg-gold px-5 py-2 text-sm font-medium text-black">
            Apply Filters
          </button>
          <Link href="/shop" className="block text-center text-xs text-muted hover:text-gold">
            Reset filters
          </Link>
        </form>

        <div className="space-y-3">
          <p className="text-sm text-muted">
            Showing <span className="text-foreground">{filteredProducts.length}</span> product(s)
          </p>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/shop/${product.slug}`}
                className="luxury-card hover-lift rounded-xl p-3"
              >
                <div
                  className="h-44 rounded-lg bg-neutral-900 bg-cover bg-center"
                  style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
                />
                <h2 className="mt-3 text-sm">{product.name}</h2>
                <p className="mt-1 text-xs text-muted">
                  {product.category?.name ?? "Luxury Essentials"} · {product.brand?.name ?? "NURU ATELIER"}
                </p>
                <p className="mt-1 text-sm text-gold">Ksh {product.priceKes.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">OUR SERVICES</p>
          <h2 className="section-title mt-2 text-3xl text-foreground">Why customers shop with Nuru</h2>
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
              <h3 className="section-title mt-4 text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

