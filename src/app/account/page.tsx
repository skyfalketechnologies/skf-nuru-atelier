"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearCustomerAuth,
  CUSTOMER_AUTH_UPDATED_EVENT,
  getCustomerProfile,
  type CustomerProfile,
} from "@/lib/customerAuth";

export default function AccountPage() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    const refresh = () => setCustomer(getCustomerProfile());
    refresh();
    window.addEventListener(CUSTOMER_AUTH_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CUSTOMER_AUTH_UPDATED_EVENT, refresh);
  }, []);

  if (!customer) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="luxury-card rounded-2xl p-8 text-center">
          <h1 className="section-title text-3xl text-gold">Account</h1>
          <p className="mt-2 text-sm text-muted">Sign in to view account details.</p>
          <Link href="/account/login" className="mt-5 inline-flex rounded-full bg-gold px-6 py-3 text-black">
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="luxury-card rounded-2xl p-8">
        <h1 className="section-title text-3xl text-gold">My Account</h1>
        <p className="mt-4 text-sm text-muted">Name: {customer.name || "Not set"}</p>
        <p className="mt-1 text-sm text-muted">Email: {customer.email}</p>
        <div className="mt-5 flex gap-3">
          <Link href="/cart" className="rounded-full bg-gold px-5 py-2 text-sm text-black">
            Continue Checkout
          </Link>
          <button
            onClick={() => {
              clearCustomerAuth();
              setCustomer(null);
            }}
            className="gold-border rounded-full px-5 py-2 text-sm text-gold hover:bg-gold/10"
          >
            Sign Out
          </button>
        </div>
      </div>
    </section>
  );
}

