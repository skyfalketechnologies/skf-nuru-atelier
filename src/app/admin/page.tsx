"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGetAuth, apiPatchAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type Metrics = {
  orders: number;
  paidOrders: number;
  deliveredOrders: number;
  customers: number;
  revenueKes: number;
};

type RecentOrder = {
  _id: string;
  totalKes: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  createdAt: string;
};

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    orders: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    customers: 0,
    revenueKes: 0,
  });
  const [unauthorized, setUnauthorized] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  async function loadDashboardData(token: string) {
    const [metricsData, ordersData] = await Promise.all([
      apiGetAuth<{ metrics: Metrics }>("/api/admin/analytics/summary", token),
      apiGetAuth<{ orders: RecentOrder[] }>("/api/orders/admin/all", token),
    ]);
    setMetrics(metricsData.metrics);
    setRecentOrders(ordersData.orders.slice(0, 5));
  }

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setUnauthorized(true);
      return;
    }
    loadDashboardData(token).catch(() => setUnauthorized(true));
  }, []);

  async function quickSetStatus(orderId: string, status: RecentOrder["status"]) {
    const token = getAuthToken();
    if (!token) return;
    await apiPatchAuth(`/api/orders/admin/${orderId}/status`, { status }, token);
    await loadDashboardData(token);
  }

  return (
    <section className="px-4 py-10">
      <div className="luxury-card rounded-xl p-6">
        <h1 className="font-serif text-2xl text-gold sm:text-3xl">Dashboard</h1>
        {unauthorized ? (
          <p className="mt-4 text-sm text-muted">
            Admin session required. <Link className="text-gold underline" href="/admin/login">Login here</Link>.
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-gold/30 p-3 text-sm">Orders: {metrics.orders}</div>
          <div className="rounded border border-gold/30 p-3 text-sm">Paid: {metrics.paidOrders}</div>
          <div className="rounded border border-gold/30 p-3 text-sm">Customers: {metrics.customers}</div>
          <div className="rounded border border-gold/30 p-3 text-sm">
            Revenue: Ksh {metrics.revenueKes.toLocaleString()}
          </div>
        </div>
        <div className="mt-6 rounded border border-gold/30 p-4">
          <h2 className="text-sm text-gold">Recent Orders</h2>
          <div className="mt-2 space-y-2 text-sm">
            {recentOrders.map((order) => (
              <div key={order._id} className="border-b border-gold/10 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-muted">{order._id.slice(-8)}</span>
                  <span>Ksh {order.totalKes.toLocaleString()}</span>
                  <span className="text-gold">{order.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["pending", "paid", "shipped", "delivered"] as const).map((state) => (
                    <button
                      key={state}
                      onClick={() => quickSetStatus(order._id, state)}
                      className={`rounded-full px-2 py-1 text-[10px] ${
                        order.status === state ? "bg-gold text-black" : "border border-gold/40 text-gold"
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!recentOrders.length ? <p className="text-muted">No recent orders</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

