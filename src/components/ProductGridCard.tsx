import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImageFrame } from "@/components/ProductImageFrame";
import { ShopProductLink } from "@/components/ShopProductLink";

export type ProductGridCardProduct = {
  _id: string;
  name: string;
  slug: string;
  priceKes: number;
  images: string[];
  stock?: number;
  category?: { name: string; slug?: string };
  brand?: { name: string; slug?: string };
};

type GtmContext = { listId: string; listName: string; index: number };

type Props = {
  product: ProductGridCardProduct;
  gtm?: GtmContext;
  listIdForCart?: string;
  listNameForCart?: string;
  source?: string;
};

export function ProductGridCard({
  product,
  gtm,
  listIdForCart = "product_grid",
  listNameForCart = "Product grid",
  source = "product_grid",
}: Props) {
  const href = `/shop/${product.slug}`;
  const outOfStock = typeof product.stock === "number" && product.stock <= 0;
  const imgFrame = "flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-transparent";

  const upper = (
    <>
      <div className="overflow-hidden rounded-t-xl">
        <ProductImageFrame src={product.images[0]} alt={product.name} className={imgFrame} />
      </div>
      <div className="px-4 pb-2 pt-3">
        <h2 className="line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-foreground sm:text-base">
          {product.name}
        </h2>
        <p className="mt-3 text-lg font-medium tabular-nums text-gold">Ksh {product.priceKes.toLocaleString()}</p>
      </div>
    </>
  );

  const linkClassName =
    "block min-h-0 rounded-t-xl outline-none transition-colors hover:bg-white/[0.02] focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold/15 bg-[linear-gradient(165deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_55%,transparent_100%)] shadow-[0_1px_0_rgba(197,164,109,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-gold/25 hover:shadow-[0_12px_28px_rgba(0,0,0,0.38)]">
      {gtm ? (
        <ShopProductLink
          href={href}
          className={linkClassName}
          product={product}
          listId={gtm.listId}
          listName={gtm.listName}
          index={gtm.index}
        >
          {upper}
        </ShopProductLink>
      ) : (
        <Link href={href} className={linkClassName}>
          {upper}
        </Link>
      )}
      <div className="mt-auto border-t border-gold/10 px-4 pb-4 pt-3">
        <AddToCartButton
          productId={product._id}
          name={product.name}
          priceKes={product.priceKes}
          listId={listIdForCart}
          listName={listNameForCart}
          source={source}
          variant="compact"
          disabled={outOfStock}
        />
      </div>
    </article>
  );
}
