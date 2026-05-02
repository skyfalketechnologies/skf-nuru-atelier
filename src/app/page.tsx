import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getAllBlogPosts } from "@/lib/blog";
import { HomepageGiftPromoAddToCart } from "@/components/HomepageGiftPromoAddToCart";
import { ProductGridCard } from "@/components/ProductGridCard";
import { ProductImageFrame } from "@/components/ProductImageFrame";
import { HomeHeroBackground } from "@/components/HomeHeroBackground";
import { HomeHeroCtas } from "@/components/HomeHeroCtas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuru Atelier | Best Giftshop in Kenya | Michaels Bouquet",
  description:
    "Shop perfumes, body care, and gift sets from NURU ATELIER. Find options for Nairobi, Mombasa, Nakuru, and Kakamega.",
  keywords: [
    "best giftshop in Kenya",
    "Michaels Bouqute Kakamega",
    "Best Gift shop in Nairobi",
    "best gift shop in mombasa",
    "best gift shop in Nakuru",
    "Perfumes stores in Kenya",
  ],
};

type FeaturedProduct = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  images: string[];
  stock?: number;
  isFeatured?: boolean;
  category?: { name: string; slug?: string };
  brand?: { name: string; slug?: string };
};

type HomepageGiftPromo = {
  discountPercent: number;
  discountedPriceKes: number;
  sectionKicker?: string;
  sectionDescription?: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    priceKes: number;
    images: string[];
    stock: number;
  };
};

const HOMEPAGE_GIFT_SECTION_DEFAULTS = {
  kicker: "OUR GIFT FOR YOU",
  description:
    "Enjoy a limited-time discount on this product. Grab it now while the offer is still active.",
};

const FALLBACK_HERO_URLS = [
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1800&q=80",
];

const FALLBACK_HERO_OVERLAY = {
  kicker: "NURU ATELIER BY SKYFALKE",
  headline: "Fragrance, Body Care, and Gift Shopping Made Easy",
  subheading:
    "Shop quality perfumes, body care products, and ready gift sets. Simple browsing, smooth checkout, and trusted delivery.",
  primaryCtaLabel: "Shop Now",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "Customize a Gift",
  secondaryCtaHref: "/gift-customization",
};

type HomepageHeroPayload = {
  imageUrls: string[];
  kicker: string;
  headline: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export default async function Home() {
  const [data, giftPromoRes, heroRes] = await Promise.all([
    apiGet<{ products: FeaturedProduct[] }>("/api/catalog/products?sort=popular&limit=8").catch(() => ({
      products: [],
    })),
    apiGet<{ promo: HomepageGiftPromo | null }>("/api/catalog/homepage-gift-promo").catch(() => ({ promo: null })),
    apiGet<HomepageHeroPayload>("/api/catalog/homepage-hero").catch(() => ({
      imageUrls: FALLBACK_HERO_URLS,
      ...FALLBACK_HERO_OVERLAY,
    })),
  ]);
  const featuredProducts = data.products.filter((product) => product.isFeatured).slice(0, 4);
  const productsToRender = featuredProducts.length ? featuredProducts : data.products.slice(0, 4);
  const bestSellingProducts = data.products.slice(0, 8);
  const giftPromo = giftPromoRes.promo;
  const heroImageUrls =
    heroRes.imageUrls?.filter((u) => typeof u === "string" && u.trim().length > 0).length > 0
      ? heroRes.imageUrls
      : FALLBACK_HERO_URLS;
  const heroOverlay = {
    kicker: heroRes.kicker?.trim() ? heroRes.kicker : FALLBACK_HERO_OVERLAY.kicker,
    headline: heroRes.headline?.trim() ? heroRes.headline : FALLBACK_HERO_OVERLAY.headline,
    subheading: heroRes.subheading?.trim() ? heroRes.subheading : FALLBACK_HERO_OVERLAY.subheading,
    primaryCtaLabel: heroRes.primaryCtaLabel?.trim()
      ? heroRes.primaryCtaLabel
      : FALLBACK_HERO_OVERLAY.primaryCtaLabel,
    primaryCtaHref: heroRes.primaryCtaHref?.trim()
      ? heroRes.primaryCtaHref
      : FALLBACK_HERO_OVERLAY.primaryCtaHref,
    secondaryCtaLabel: heroRes.secondaryCtaLabel?.trim()
      ? heroRes.secondaryCtaLabel
      : FALLBACK_HERO_OVERLAY.secondaryCtaLabel,
    secondaryCtaHref: heroRes.secondaryCtaHref?.trim()
      ? heroRes.secondaryCtaHref
      : FALLBACK_HERO_OVERLAY.secondaryCtaHref,
  };
  const brandLogos = [
    { name: "Michaels Bouquet", src: "/brands/michaels.webp" },
    { name: "Maybeline", src: "/brands/maybelline.png" },
    { name: "Tommy Hilfiger", src: "/brands/tommy_hilfiger.png" },
    { name: "Chanel", src: "/brands/chanel.png" },

  ];
  const testimonials = [
    {
      quote:
        "The fragrance quality is extraordinary. Every order feels personal, beautifully packed, and truly premium.",
      name: "Amina N.",
      location: "Nairobi",
    },
    {
      quote:
        "I customized a gift set for my sister and it arrived flawless. Elegant details, fast delivery, unforgettable experience.",
      name: "Lena S.",
      location: "Mombasa",
    },
    {
      quote:
        "NURU ATELIER feels like a global luxury house. The scents, the packaging, and the care are exceptional.",
      name: "Brian K.",
      location: "Kisumu",
    },
  ];
  const latestPosts = (await getAllBlogPosts().catch(() => [])).slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <section className="luxury-card luxury-hero relative overflow-hidden rounded-2xl px-5 py-12 sm:px-10 sm:py-16">
        <HomeHeroBackground imageUrls={heroImageUrls} />
        <div className="hero-overlay" aria-hidden />
        <p className="relative z-[1] mb-4 text-xs tracking-[0.3em] text-gold">{heroOverlay.kicker}</p>
        <h1 className="section-title relative z-[1] max-w-3xl text-4xl leading-tight text-foreground sm:text-7xl">
          {heroOverlay.headline}
        </h1>
        <p className="relative z-[1] mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          {heroOverlay.subheading}
        </p>
        <HomeHeroCtas
          primaryHref={heroOverlay.primaryCtaHref}
          primaryLabel={heroOverlay.primaryCtaLabel}
          secondaryHref={heroOverlay.secondaryCtaHref}
          secondaryLabel={heroOverlay.secondaryCtaLabel}
        />
      </section>

      <section className="luxury-card overflow-hidden rounded-2xl p-6 sm:p-8">
        <p className="text-xs tracking-[0.25em] text-gold">BRANDS WE STOCK</p>
        <h2 className="section-title mt-2 text-3xl">Trusted Brands, Curated for You</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Discover authentic beauty and fragrance names selected for quality, style, and everyday
          confidence.
        </p>
        <div className="marquee-fade mt-6">
          <div className="marquee-track">
            {[...brandLogos, ...brandLogos].map((brand, index) => (
              <img
                key={`${brand.name}-${index}`}
                src={brand.src}
                alt={`${brand.name} logo`}
                className="marquee-logo"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs tracking-[0.25em] text-gold">FEATURED PRODUCTS</p>
            <h2 className="section-title mt-2 text-3xl">Our Most Desired Pieces</h2>
          </div>
          <Link href="/shop" className="text-sm text-gold hover:text-foreground">
            View all products
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {productsToRender.map((product) => (
            <ProductGridCard
              key={product._id}
              product={product}
              listIdForCart="home_featured"
              listNameForCart="Featured products"
              source="home_featured"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs tracking-[0.25em] text-gold">BEST SELLING</p>
            <h2 className="section-title mt-2 text-3xl">Best Selling Picks</h2>
          </div>
          <Link href="/shop?sort=popular" className="text-sm text-gold hover:text-foreground">
            Browse best sellers
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {bestSellingProducts.map((product) => (
            <ProductGridCard
              key={`best-${product._id}`}
              product={product}
              listIdForCart="home_best_sellers"
              listNameForCart="Best selling"
              source="home_best_sellers"
            />
          ))}
        </div>
      </section>

      {giftPromo ? (
        <section className="luxury-card rounded-2xl p-6 sm:p-8">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">
            {giftPromo.sectionKicker?.trim() || HOMEPAGE_GIFT_SECTION_DEFAULTS.kicker}
          </p>
          <div className="mt-3 grid gap-5 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
            <div>
              <h2 className="section-title text-3xl">{giftPromo.product.name}</h2>
              <p className="mt-3 max-w-xl whitespace-pre-line text-sm leading-7 text-muted">
                {giftPromo.sectionDescription?.trim() || HOMEPAGE_GIFT_SECTION_DEFAULTS.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted line-through">
                  Ksh {giftPromo.product.priceKes.toLocaleString()}
                </span>
                <span className="text-xl font-medium text-gold">
                  Ksh {giftPromo.discountedPriceKes.toLocaleString()}
                </span>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
                  -{giftPromo.discountPercent}%
                </span>
              </div>
              <HomepageGiftPromoAddToCart
                productId={giftPromo.product._id}
                name={giftPromo.product.name}
                discountedPriceKes={giftPromo.discountedPriceKes}
                slug={giftPromo.product.slug}
                inStock={giftPromo.product.stock > 0}
              />
            </div>
            <ProductImageFrame
              src={giftPromo.product.images[0]}
              alt={giftPromo.product.name}
              className="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-transparent"
            />
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-gold">TESTIMONIALS</p>
          <h2 className="section-title mt-2 text-3xl">What Our Customers Are Saying</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="luxury-card rounded-xl p-5">
              <p className="text-sm leading-7 text-muted">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-sm text-foreground">{item.name}</p>
              <p className="text-xs tracking-[0.15em] text-gold">{item.location}</p>
            </article>
          ))}
        </div>
      </section>

      {latestPosts.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs tracking-[0.25em] text-gold">EDITORIAL</p>
              <h2 className="section-title mt-2 text-3xl">From the NURU Journal</h2>
            </div>
            <Link href="/blog" className="text-sm text-gold hover:text-foreground">
              Visit the blog
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {latestPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="luxury-card hover-lift rounded-xl p-5">
                <p className="text-xs tracking-[0.2em] text-gold">{post.category.toUpperCase()}</p>
                <h3 className="section-title mt-3 text-2xl leading-tight">{post.title}</h3>
                <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                <p className="mt-3 text-xs text-muted">
                  {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {post.readTimeMinutes} min read
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="luxury-card rounded-2xl p-6 text-center sm:p-10">
        <p className="text-xs tracking-[0.3em] text-gold">PRIVATE CURATION</p>
        <h2 className="section-title mt-3 text-3xl sm:text-4xl">
          Build Your Gift Package
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Choose products, pick packaging, and add your message. We will prepare it for delivery.
        </p>
        <Link
          href="/gift-customization"
          className="mt-7 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:opacity-90"
        >
          Start Gift Builder
        </Link>
      </section>
    </main>
  );
}
