"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import {
  clearCustomerAuth,
  CUSTOMER_AUTH_UPDATED_EVENT,
  getCustomerProfile,
  getCustomerToken,
  setCustomerAuth,
  type CustomerProfile,
} from "@/lib/customerAuth";

export default function AccountPage() {
  type OrderHistoryItem = {
    _id: string;
    publicOrderId?: string;
    totalKes: number;
    status: string;
    paymentStatus?: string;
    paymentReference?: string;
    createdAt: string;
  };

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function hydrateForm(profile: CustomerProfile | null) {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
    setCity(profile?.city || "");
    setArea(profile?.area || "");
    setAddressLine(profile?.addressLine || "");
  }

  useEffect(() => {
    const refresh = () => {
      const profile = getCustomerProfile();
      setCustomer(profile);
      hydrateForm(profile);
    };
    refresh();
    window.addEventListener(CUSTOMER_AUTH_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CUSTOMER_AUTH_UPDATED_EVENT, refresh);
  }, []);

  useEffect(() => {
    async function loadOrderHistory() {
      const token = getCustomerToken();
      if (!token) return;
      setLoadingOrders(true);
      try {
        const data = await apiGetAuth<{ orders: OrderHistoryItem[] }>("/api/orders/me", token);
        setOrders(data.orders || []);
      } catch {
        // non-blocking: keep account form usable
      } finally {
        setLoadingOrders(false);
      }
    }
    void loadOrderHistory();
  }, []);

  useEffect(() => {
    async function loadLatestProfile() {
      const token = getCustomerToken();
      if (!token) return;
      try {
        const data = await apiGetAuth<{ user: CustomerProfile }>("/api/auth/me", token);
        setCustomerAuth(token, data.user);
        setCustomer(data.user);
        hydrateForm(data.user);
      } catch {
        // keep local profile as fallback
      }
    }
    void loadLatestProfile();
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const token = getCustomerToken();
    if (!token) {
      setError("Please sign in again.");
      return;
    }
    setSaving(true);
    try {
      const data = await apiPatchAuth<{ user: CustomerProfile }>(
        "/api/auth/me",
        { name, phone, city, area, addressLine },
        token
      );
      setCustomerAuth(token, data.user);
      setCustomer(data.user);
      setMessage("Account details updated.");
    } catch {
      setError("Could not update your account details.");
    } finally {
      setSaving(false);
    }
  }

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
        <p className="mt-2 text-sm text-muted">Keep your standard details updated for faster checkout.</p>
        <form onSubmit={saveProfile} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            value={customer.email}
            disabled
          />
          <input
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
          <input
            className="rounded border border-gold/40 bg-black p-3 text-sm"
            placeholder="Address line"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
          />
          <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-gold px-5 py-2 text-sm text-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
            <Link href="/cart" className="rounded-full bg-gold px-5 py-2 text-sm text-black">
              Continue Checkout
            </Link>
            <button
              type="button"
              onClick={() => {
                clearCustomerAuth();
                setCustomer(null);
              }}
              className="gold-border rounded-full px-5 py-2 text-sm text-gold hover:bg-gold/10"
            >
              Sign Out
            </button>
          </div>
          {message ? <p className="sm:col-span-2 text-sm text-gold">{message}</p> : null}
          {error ? <p className="sm:col-span-2 text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
      <div className="mt-6 luxury-card rounded-2xl p-8">
        <h2 className="section-title text-2xl text-gold">Order History</h2>
        <p className="mt-2 text-sm text-muted">Review your past orders and current statuses.</p>
        <div className="mt-4 space-y-3">
          {loadingOrders ? (
            <p className="text-sm text-muted">Loading your orders...</p>
          ) : null}
          {!loadingOrders && orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet. Your orders will appear here.</p>
          ) : null}
          {orders.map((order) => (
            <div key={order._id} className="rounded-xl border border-gold/20 p-4">
              <p className="text-sm text-gold">
                Order Ref: {order.publicOrderId || order._id}
              </p>
              <p className="mt-1 text-xs text-muted">
                {new Date(order.createdAt).toLocaleString()} | Total: Ksh {order.totalKes.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted">
                Order: {order.status} | Payment: {order.paymentStatus || "pending"}
                {order.paymentReference ? ` | Pay Ref: ${order.paymentReference}` : ""}
              </p>
              <Link
                href={`/track-order?orderId=${encodeURIComponent(order.publicOrderId || order._id)}`}
                className="mt-2 inline-block text-xs text-gold hover:underline"
              >
                Track this order
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

