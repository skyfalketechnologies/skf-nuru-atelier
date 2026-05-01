"use client";

import { trackSelectItem } from "@/lib/gtm-ecommerce";
import Link from "next/link";
import type { ReactNode } from "react";

type Product = {
  _id: string;
  name: string;
  priceKes: number;
  category?: { name: string; slug?: string };
  brand?: { name: string; slug?: string };
};

type Props = {
  href: string;
  className?: string;
  product: Product;
  listId: string;
  listName: string;
  index: number;
  children: ReactNode;
};

export function ShopProductLink({ href, className, product, listId, listName, index, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackSelectItem(product, { listId, listName, index })}
    >
      {children}
    </Link>
  );
}
