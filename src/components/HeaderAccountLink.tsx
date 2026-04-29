"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CUSTOMER_AUTH_UPDATED_EVENT,
  getCustomerProfile,
  type CustomerProfile,
} from "@/lib/customerAuth";

export function HeaderAccountLink() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    const refresh = () => setCustomer(getCustomerProfile());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CUSTOMER_AUTH_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CUSTOMER_AUTH_UPDATED_EVENT, refresh);
    };
  }, []);

  return (
    <Link
      href={customer ? "/account" : "/account/login"}
      className="gold-border relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gold hover:bg-gold/10"
      aria-label={customer ? "Account" : "Sign In"}
      title={customer ? "Account" : "Sign In"}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.8-3.4 5-5 8-5s6.2 1.6 8 5" />
      </svg>
      {customer ? (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
      ) : null}
    </Link>
  );
}

