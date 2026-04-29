import { apiGet } from "@/lib/api";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductReviews } from "@/components/ProductReviews";

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await apiGet<{ product: Product }>(`/api/catalog/products/${slug}`).catch(() => null);

  if (!data) {
    return <section className="mx-auto max-w-5xl px-4 py-10 text-muted">Product unavailable.</section>;
  }

  const product = data.product;
  const inStock = product.stock > 0;
  const reviews = product.reviews ?? [];

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-4">
          <div
            className="luxury-card h-72 rounded-2xl bg-neutral-900 bg-cover bg-center sm:h-96"
            style={{ backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : undefined }}
          />
          <div className="grid grid-cols-3 gap-3">
            {(product.images?.length ? product.images : [undefined, undefined, undefined]).map((image, index) => (
              <div
                key={`${image ?? "placeholder"}-${index}`}
                className="luxury-card h-28 rounded-xl bg-neutral-900 bg-cover bg-center"
                style={{ backgroundImage: image ? `url(${image})` : undefined }}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="section-title text-3xl text-gold sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-xs tracking-[0.2em] text-muted">
            {(product.category?.name ?? "Luxury Essentials").toUpperCase()} · {(product.brand?.name ?? "NURU ATELIER").toUpperCase()}
          </p>
          <p className="mt-4 leading-7 text-muted">{product.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-2xl">Ksh {product.priceKes.toLocaleString()}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                inStock ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {inStock ? `In stock (${product.stock})` : "Out of stock"}
            </span>
          </div>
          <p className="mt-5 text-sm text-muted">
            Made with quality materials and care, so you get a product that looks good and lasts.
          </p>
        <AddToCartButton
          productId={product._id}
          name={product.name}
          priceKes={product.priceKes}
        />
        </div>
      </div>

      <div className="luxury-card rounded-2xl p-6">
        <p className="text-xs tracking-[0.2em] text-gold">PRODUCT DESCRIPTION</p>
        <p className="mt-3 leading-8 text-muted">{product.description}</p>
      </div>

      <ProductReviews slug={slug} initialReviews={reviews} />
    </section>
  );
}

