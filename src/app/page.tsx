import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getAllBlogPosts } from "@/lib/blog";
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
  isFeatured?: boolean;
};

export default async function Home() {
  const data = await apiGet<{ products: FeaturedProduct[] }>(
    "/api/catalog/products?sort=popular&limit=8"
  ).catch(() => ({ products: [] }));
  const featuredProducts = data.products.filter((product) => product.isFeatured).slice(0, 4);
  const productsToRender = featuredProducts.length ? featuredProducts : data.products.slice(0, 4);
  const bestSellingProducts = data.products.slice(0, 8);
  const giftProduct = productsToRender[0];
  const giftDiscountRate = 0.2;
  const giftDiscountedPrice = giftProduct
    ? Math.round(giftProduct.priceKes * (1 - giftDiscountRate))
    : 0;
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
  const latestPosts = getAllBlogPosts().slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <section className="luxury-card luxury-hero hero-slider relative overflow-hidden rounded-2xl px-5 py-12 sm:px-10 sm:py-16">
        <div className="hero-slider-track" aria-hidden>
          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=80)",
            }}
          />
          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1800&q=80)",
            }}
          />
          <div
            className="hero-slide"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1800&q=80)",
            }}
          />
        </div>
        <div className="hero-overlay" aria-hidden />
        <p className="relative z-[1] mb-4 text-xs tracking-[0.3em] text-gold">NURU ATELIER BY SKYFALKE</p>
        <h1 className="section-title relative z-[1] max-w-3xl text-4xl leading-tight text-foreground sm:text-7xl">
          Fragrance, Body Care, and Gift Shopping Made Easy
        </h1>
        <p className="relative z-[1] mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Shop quality perfumes, body care products, and ready gift sets. Simple browsing, smooth
          checkout, and trusted delivery.
        </p>
        <div className="relative z-[1] mt-9 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:opacity-90"
          >
            Shop Now
          </Link>
          <Link
            href="/gift-customization"
            className="gold-border rounded-full px-6 py-3 text-sm text-gold hover:bg-gold/10"
          >
            Customize a Gift
          </Link>
        </div>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {productsToRender.map((product) => (
            <Link
              key={product._id}
              href={`/shop/${product.slug}`}
              className="luxury-card hover-lift rounded-xl p-3"
            >
              <div
                className="h-40 rounded-lg bg-neutral-900 bg-cover bg-center"
                style={{ backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined }}
              />
              <h3 className="mt-3 text-sm">{product.name}</h3>
              <p className="mt-1 text-sm text-gold">Ksh {product.priceKes.toLocaleString()}</p>
            </Link>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {bestSellingProducts.map((product) => (
            <Link
              key={`best-${product._id}`}
              href={`/shop/${product.slug}`}
              className="luxury-card hover-lift rounded-xl p-3"
            >
              <div
                className="h-36 rounded-lg bg-neutral-900 bg-cover bg-center"
                style={{
                  backgroundImage: product.images[0]
                    ? `url(${product.images[0]})`
                    : undefined,
                }}
              />
              <h3 className="mt-3 text-sm">{product.name}</h3>
              <p className="mt-1 text-sm text-gold">Ksh {product.priceKes.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>

      {giftProduct ? (
        <section className="luxury-card rounded-2xl p-6 sm:p-8">
          <p className="text-xs tracking-[0.25em] text-gold">OUR GIFT FOR YOU</p>
          <div className="mt-3 grid gap-5 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
            <div>
              <h2 className="section-title text-3xl">{giftProduct.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
                Enjoy a limited-time discount on this product. Grab it now while the offer is still
                active.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted line-through">
                  Ksh {giftProduct.priceKes.toLocaleString()}
                </span>
                <span className="text-xl font-medium text-gold">
                  Ksh {giftDiscountedPrice.toLocaleString()}
                </span>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">
                  -20%
                </span>
              </div>
              <Link
                href={`/shop/${giftProduct.slug}`}
                className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:opacity-90"
              >
                Get This Offer
              </Link>
            </div>
            <div
              className="h-56 rounded-xl bg-neutral-900 bg-cover bg-center"
              style={{
                backgroundImage: giftProduct.images[0]
                  ? `url(${giftProduct.images[0]})`
                  : undefined,
              }}
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
