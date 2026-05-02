import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { apiGet } from "@/lib/api";
import { AddToCartButton } from "@/components/AddToCartButton";
import { GtmProductViewTracker } from "@/components/GtmProductViewTracker";
import { ProductDetailGallery } from "@/components/ProductDetailGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductRichText } from "@/components/ProductRichText";
import { ProductShareBar } from "@/components/ProductShareBar";

type Product = {
  _id: string;
  name: string;
  description: string;
  priceKes: number;
  images: string[];
  stock: number;
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string };
  reviews?: { _id?: string; name: string; rating: number; comment: string; createdAt?: string }[];
};

type HomepageGiftPromo = {
  discountPercent: number;
  discountedPriceKes: number;
  product: { _id: string };
};

const getShopProductBySlug = cache(async (slug: string) => {
  return apiGet<{ product: Product }>(`/api/catalog/products/${slug}`).catch(() => null);
});

async function resolveSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

function plainTextFromHtml(html: string, maxLen: number): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "\u003c")
    .replace(/&gt;/g, "\u003e")
    .replace(/&quot;/g, "\u0022")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trim()}…`;
}

function absoluteImageUrl(origin: string, src: string): string {
  const s = src.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (!origin) return s;
  return `${origin}${s.startsWith("/") ? s : `/${s}`}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [data, origin] = await Promise.all([getShopProductBySlug(slug), resolveSiteOrigin()]);

  if (!data) {
    return {
      title: "Product unavailable",
      description: "This product is not available at NURU ATELIER. Browse our shop for perfumes, gifts, and body care in Kenya.",
      robots: { index: false, follow: true },
    };
  }

  const product = data.product;
  const categoryName = product.category?.name ?? "Luxury Essentials";
  const brandName = product.brand?.name ?? "NURU ATELIER";
  const description =
    plainTextFromHtml(product.description, 158) ||
    `Shop ${product.name} from ${brandName} — ${categoryName}. Premium gifts and fragrance in Kenya at NURU ATELIER.`;

  const keywords = [
    product.name,
    brandName,
    categoryName,
    "NURU ATELIER",
    "gift shop Kenya",
    "perfume Kenya",
    "Ksh",
  ];

  const canonicalPath = `/shop/${slug}`;
  const canonical = origin ? `${origin}${canonicalPath}` : undefined;
  const firstImage = product.images?.find((u) => typeof u === "string" && u.trim().length > 0);
  const trimmedImg = firstImage?.trim();
  const ogImage =
    trimmedImg &&
    (trimmedImg.startsWith("http://") || trimmedImg.startsWith("https://")
      ? trimmedImg
      : origin
        ? absoluteImageUrl(origin, trimmedImg)
        : undefined);

  return {
    title: product.name,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: product.name,
      description,
      url: canonical,
      siteName: "NURU ATELIER",
      locale: "en_KE",
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function BreadcrumbChevron() {
  return (
    <span className="mx-1.5 text-gold/35" aria-hidden>
      /
    </span>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, promoRes, origin] = await Promise.all([
    getShopProductBySlug(slug),
    apiGet<{ promo: HomepageGiftPromo | null }>("/api/catalog/homepage-gift-promo").catch(() => ({ promo: null })),
    resolveSiteOrigin(),
  ]);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <div className="luxury-card rounded-2xl p-8 text-center sm:p-10">
          <p className="text-xs tracking-[0.25em] text-gold">PRODUCT</p>
          <h1 className="section-title mt-3 text-2xl text-foreground sm:text-3xl">This product is unavailable</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            It may have been removed or the link could be incorrect. Browse the catalog to find something similar.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full border border-gold/45 bg-gold px-6 py-2.5 text-sm font-medium text-black transition hover:bg-gold/90"
          >
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const product = data.product;
  const inStock = product.stock > 0;
  const reviews = product.reviews ?? [];
  const homepagePromo =
    promoRes.promo && String(promoRes.promo.product._id) === String(product._id) ? promoRes.promo : null;
  const cartPriceKes = homepagePromo ? homepagePromo.discountedPriceKes : product.priceKes;

  const categoryName = product.category?.name ?? "Luxury Essentials";
  const brandName = product.brand?.name ?? "NURU ATELIER";
  const categorySlug = product.category?.slug;
  const brandSlug = product.brand?.slug;

  const shareUrl = origin ? `${origin}/shop/${slug}` : `/shop/${slug}`;

  return (
    <main className="pb-16 pt-6 sm:pb-20 sm:pt-8">
      <GtmProductViewTracker
        product={{
          _id: product._id,
          name: product.name,
          priceKes: cartPriceKes,
          category: product.category,
          brand: product.brand,
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="mb-8 text-[11px] uppercase tracking-[0.18em] text-muted sm:text-xs" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-y-1">
            <li>
              <Link href="/" className="text-muted transition hover:text-gold">
                Home
              </Link>
            </li>
            <BreadcrumbChevron />
            <li>
              <Link href="/shop" className="text-muted transition hover:text-gold">
                Shop
              </Link>
            </li>
            {categorySlug ? (
              <>
                <BreadcrumbChevron />
                <li>
                  <Link href={`/shop?category=${encodeURIComponent(categorySlug)}`} className="text-muted transition hover:text-gold">
                    {categoryName}
                  </Link>
                </li>
              </>
            ) : null}
            <BreadcrumbChevron />
            <li className="max-w-[min(100%,14rem)] truncate font-normal normal-case tracking-normal text-foreground/90 sm:max-w-md">
              {product.name}
            </li>
          </ol>
        </nav>

        <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(24rem,38%)] lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <ProductDetailGallery images={product.images ?? []} productName={product.name} />
          </div>

          <aside className="luxury-card flex flex-col rounded-2xl border border-gold/15 p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">{brandName}</p>
            <h1 className="section-title mt-3 text-3xl leading-[1.15] text-foreground sm:text-4xl">{product.name}</h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              {categorySlug ? (
                <Link href={`/shop?category=${encodeURIComponent(categorySlug)}`} className="transition hover:text-gold">
                  {categoryName}
                </Link>
              ) : (
                <span>{categoryName}</span>
              )}
              <span className="text-gold/40" aria-hidden>
                ·
              </span>
              {brandSlug ? (
                <Link href={`/shop?brand=${encodeURIComponent(brandSlug)}`} className="transition hover:text-gold">
                  {brandName}
                </Link>
              ) : (
                <span>{brandName}</span>
              )}
            </p>

            <ProductShareBar url={shareUrl} title={product.name} className="mt-5" />

            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden />

            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Price</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  {homepagePromo ? (
                    <>
                      <span className="text-lg text-muted line-through tabular-nums">Ksh {product.priceKes.toLocaleString()}</span>
                      <span className="text-3xl font-medium tabular-nums text-gold sm:text-4xl">
                        Ksh {homepagePromo.discountedPriceKes.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-gold/12 px-2.5 py-1 text-[11px] font-medium text-gold">
                        −{homepagePromo.discountPercent}% gift offer
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-medium tabular-nums text-foreground sm:text-4xl">
                      Ksh {product.priceKes.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    inStock ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25" : "bg-red-500/15 text-red-200 ring-1 ring-red-500/25"
                  }`}
                >
                  {inStock ? `In stock · ${product.stock} available` : "Currently out of stock"}
                </span>
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted/90">
              Delivery available across Kenya.
            </p>

            <div className="mt-8 border-t border-gold/10 pt-8">
              <AddToCartButton
                productId={product._id}
                name={product.name}
                priceKes={cartPriceKes}
                listId="product_detail"
                listName="Product detail"
                source="pdp"
                variant="compact"
                disabled={!inStock}
              />
              <Link href="/shop" className="mt-4 block text-center text-xs text-muted transition hover:text-gold">
                Continue shopping
              </Link>
            </div>
          </aside>
        </article>

        <section className="mt-14 sm:mt-20" aria-labelledby="product-description-heading">
          <div className="luxury-card rounded-2xl border border-gold/12 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-2 border-b border-gold/10 pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
              <div>
                <p className="text-xs tracking-[0.22em] text-gold">DETAILS</p>
                <h2 id="product-description-heading" className="section-title mt-2 text-2xl text-foreground sm:text-3xl">
                  About this product
                </h2>
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <ProductRichText html={product.description} className="text-base sm:text-[17px]" />
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-14">
          <ProductReviews slug={slug} initialReviews={reviews} />
        </section>
      </div>
    </main>
  );
}
