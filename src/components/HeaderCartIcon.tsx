"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CART_UPDATED_EVENT, readCart } from "@/lib/cart";

export function HeaderCartIcon() {
  const [count, setCount] = useState(0);

  const refresh = () => {
    const items = readCart();
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    setCount(total);
  };

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
    };
  }, []);

  const badge = useMemo(() => (count > 99 ? "99+" : String(count)), [count]);

  return (
    <Link
      href="/cart"
      className="gold-border relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gold hover:bg-gold/10"
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7" />
        <circle cx="10" cy="19" r="1.4" />
        <circle cx="17" cy="19" r="1.4" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-black">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

