"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";

type Customer = {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
};

type CustomerOrder = {
  _id: string;
  totalKes: number;
  status: string;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);

  async function loadCustomers(query = "") {
    setLoadingCustomers(true);
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      setToastTone("error");
      setLoadingCustomers(false);
      return;
    }
    try {
      const path = query ? `/api/admin/customers?q=${encodeURIComponent(query)}` : "/api/admin/customers";
      const data = await apiGetAuth<{ customers: Customer[] }>(path, token);
      setCustomers(data.customers);
    } catch {
      setMessage("Unable to load customers.");
      setToastTone("error");
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadCustomerOrders(customerId: string) {
    setLoadingOrders(true);
    const token = getAuthToken();
    if (!token) {
      setLoadingOrders(false);
      return;
    }
    try {
      const data = await apiGetAuth<{ orders: CustomerOrder[] }>(
        `/api/admin/customers/${customerId}/orders`,
        token
      );
      setSelectedCustomerId(customerId);
      setCustomerOrders(data.orders);
      setMessage("Customer orders loaded.");
      setToastTone("success");
    } catch {
      setMessage("Unable to load customer orders.");
      setToastTone("error");
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    loadCustomers(q);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-2xl text-gold sm:text-3xl">Customers</h1>
      {message && !loadingCustomers ? (
        <div className="mt-2 flex items-center gap-3 text-sm text-muted">
          <span>{message}</span>
          <button className="text-gold underline" onClick={() => loadCustomers(q)}>
            Retry
          </button>
        </div>
      ) : null}
      <form onSubmit={onSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="w-full rounded border border-gold/40 bg-black p-2"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="rounded bg-gold px-4 text-black">Search</button>
      </form>
      <div className="mt-6 space-y-2">
        {loadingCustomers
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 animate-pulse rounded border border-gold/20 bg-white/5" />
            ))
          : null}
        {customers.map((customer) => (
          <button
            key={customer._id}
            className="luxury-card w-full rounded-lg p-3 text-left text-sm"
            onClick={() => loadCustomerOrders(customer._id)}
          >
            <p>{customer.name || "Unnamed customer"}</p>
            <p className="text-muted">{customer.email}</p>
            <p className="text-xs text-muted">{new Date(customer.createdAt).toLocaleString()}</p>
          </button>
        ))}
      </div>
      {selectedCustomerId ? (
        <div className="mt-8">
          <h2 className="text-sm text-gold">Customer Orders</h2>
          <div className="mt-3 space-y-2">
            {loadingOrders
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-12 animate-pulse rounded border border-gold/20 bg-white/5" />
                ))
              : null}
            {customerOrders.map((order) => (
              <div key={order._id} className="rounded border border-gold/30 p-2 text-sm">
                {order._id.slice(-8)} - Ksh {order.totalKes.toLocaleString()} - {order.status}
              </div>
            ))}
            {!customerOrders.length ? <p className="text-sm text-muted">No orders for this customer.</p> : null}
          </div>
        </div>
      ) : null}
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}

