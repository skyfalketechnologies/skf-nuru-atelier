"use client";

import { useEffect, useState } from "react";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered";

type AdminOrder = {
  _id: string;
  totalKes: number;
  status: OrderStatus;
  paymentReference?: string;
  shippingAddress: { fullName: string; city: string; phone: string };
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      return;
    }
    try {
      const data = await apiGetAuth<{ orders: AdminOrder[] }>("/api/orders/admin/all", token);
      setOrders(data.orders);
    } catch {
      setMessage("Unable to load orders.");
      setToastTone("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const token = getAuthToken();
    if (!token) return;
    await apiPatchAuth(`/api/orders/admin/${orderId}/status`, { status }, token);
    await loadOrders();
    setMessage(`Order status set to ${status}.`);
    setToastTone("success");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-serif text-2xl text-gold sm:text-3xl">Order Operations</h1>
      {message && !loading ? (
        <div className="mt-2 flex items-center gap-3 text-sm text-muted">
          <span>{message}</span>
          <button className="text-gold underline" onClick={loadOrders}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-xl border border-gold/20 bg-white/5" />
            ))
          : null}
        {orders.map((order) => (
          <div key={order._id} className="luxury-card rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted">
                {order.shippingAddress.fullName} - {order.shippingAddress.city}
              </p>
              <p className="text-sm text-gold">Ksh {order.totalKes.toLocaleString()}</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Ref: {order.paymentReference || "N/A"} | {new Date(order.createdAt).toLocaleString()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["pending", "paid", "shipped", "delivered"] as OrderStatus[]).map((state) => (
                <button
                  key={state}
                  onClick={() => updateStatus(order._id, state)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    order.status === state
                      ? "bg-gold text-black"
                      : "border border-gold/40 text-gold hover:bg-gold/10"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}

