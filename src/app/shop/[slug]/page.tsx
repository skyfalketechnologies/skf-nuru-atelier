import { apiGet } from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  description: string;
  priceKes: number;
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await apiGet<{ product: Product }>(`/api/catalog/products/${slug}`).catch(() => null);

  if (!data) {
    return <section className="mx-auto max-w-5xl px-4 py-10 text-muted">Product unavailable.</section>;
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2">
      <div className="luxury-card h-96 rounded-2xl" />
      <div>
        <h1 className="font-serif text-4xl text-gold">{data.product.name}</h1>
        <p className="mt-4 leading-7 text-muted">{data.product.description}</p>
        <p className="mt-6 text-2xl">Ksh {data.product.priceKes.toLocaleString()}</p>
        <button className="mt-6 rounded-full bg-gold px-6 py-3 text-black">Add to Cart</button>
      </div>
    </section>
  );
}

