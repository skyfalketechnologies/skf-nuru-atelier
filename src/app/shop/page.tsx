import Link from "next/link";
import { apiGet } from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  images: string[];
};

export default async function ShopPage() {
  const data = await apiGet<{ products: Product[] }>("/api/catalog/products?sort=newest").catch(() => ({
    products: [],
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl text-gold">Shop Collection</h1>
      <p className="mt-2 text-sm text-muted">Luxury essentials in KES (Ksh).</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.products.map((product) => (
          <Link
            key={product._id}
            href={`/shop/${product.slug}`}
            className="luxury-card hover-lift rounded-xl p-3"
          >
            <div className="h-44 rounded-lg bg-neutral-900" />
            <h2 className="mt-3 text-sm">{product.name}</h2>
            <p className="mt-1 text-sm text-gold">Ksh {product.priceKes.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

