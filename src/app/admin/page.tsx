"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { adminModules } from "@/lib/adminModules";

type Metrics = {
  orders: number;
  paidOrders: number;
  deliveredOrders: number;
  customers: number;
  revenueKes: number;
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

  async function loadDashboardData(token: string) {
    const metricsData = await apiGetAuth<{ metrics: Metrics }>("/api/admin/analytics/summary", token);
    setMetrics(metricsData.metrics);
  }

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setUnauthorized(true);
      return;
    }
    loadDashboardData(token).catch(() => setUnauthorized(true));
  }, []);

  const paymentRate = metrics.orders > 0 ? (metrics.paidOrders / metrics.orders) * 100 : 0;
  const deliveryRate = metrics.orders > 0 ? (metrics.deliveredOrders / metrics.orders) * 100 : 0;
  const collectionRate = metrics.paidOrders > 0 ? (metrics.deliveredOrders / metrics.paidOrders) * 100 : 0;
  const pendingOrders = Math.max(metrics.orders - metrics.deliveredOrders, 0);
  const averageOrderValue = metrics.paidOrders > 0 ? Math.round(metrics.revenueKes / metrics.paidOrders) : 0;

  return (
    <section className="space-y-6">
      <div className="luxury-card rounded-2xl border border-gold/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Operations Overview</p>
            <h1 className="mt-1 font-serif text-2xl text-gold sm:text-3xl">Admin Performance Dashboard</h1>
            <p className="mt-1 text-sm text-muted">Business health, order performance, and priority actions.</p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-black/30 px-4 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Total Revenue</p>
            <p className="mt-1 text-lg font-medium text-gold">Ksh {metrics.revenueKes.toLocaleString()}</p>
          </div>
        </div>
        {unauthorized ? (
          <p className="mt-4 text-sm text-muted">
            Admin session required. <Link className="text-gold underline" href="/admin/login">Login here</Link>.
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gold/30 bg-black/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Total Orders</p>
            <p className="mt-2 text-2xl font-medium text-gold">{metrics.orders.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted">All order records</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-300/85">Paid Orders</p>
            <p className="mt-2 text-2xl font-medium text-emerald-200">{metrics.paidOrders.toLocaleString()}</p>
            <p className="mt-1 text-xs text-emerald-100/70">{paymentRate.toFixed(1)}% payment capture rate</p>
          </div>
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-sky-300/85">Delivered Orders</p>
            <p className="mt-2 text-2xl font-medium text-sky-200">{metrics.deliveredOrders.toLocaleString()}</p>
            <p className="mt-1 text-xs text-sky-100/70">{deliveryRate.toFixed(1)}% delivery completion</p>
          </div>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-violet-300/85">Customers</p>
            <p className="mt-2 text-2xl font-medium text-violet-200">{metrics.customers.toLocaleString()}</p>
            <p className="mt-1 text-xs text-violet-100/70">Avg. order value Ksh {averageOrderValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
          <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Performance Pipeline</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-gold/20 bg-black/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-foreground">Order to Payment</p>
                <span className="text-gold">{paymentRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(paymentRate, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">
                {metrics.paidOrders.toLocaleString()} paid out of {metrics.orders.toLocaleString()} orders.
              </p>
            </div>
            <div className="rounded-lg border border-gold/20 bg-black/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-foreground">Order to Delivery</p>
                <span className="text-gold">{deliveryRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.min(deliveryRate, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">
                {metrics.deliveredOrders.toLocaleString()} delivered; {pendingOrders.toLocaleString()} still in progress.
              </p>
            </div>
            <div className="rounded-lg border border-gold/20 bg-black/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-foreground">Paid to Delivered</p>
                <span className="text-gold">{collectionRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(collectionRate, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">
                Delivery execution quality against paid orders.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Priority Modules</h2>
            <div className="mt-3 space-y-2">
              {adminModules
                .filter((module) => ["/admin/analytics", "/admin/inventory", "/admin/finance", "/admin/customers"].includes(module.href))
                .map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="block rounded-lg border border-gold/20 p-3 transition hover:bg-gold/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{module.label}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${module.status === "live" ? "border border-emerald-500/40 text-emerald-300" : "border border-gold/40 text-gold"}`}>
                      {module.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{module.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
            <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Snapshot</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-gold/20 bg-black/30 p-3">
                <p className="text-xs text-muted">Pending Orders</p>
                <p className="mt-1 text-lg text-gold">{pendingOrders.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-gold/20 bg-black/30 p-3">
                <p className="text-xs text-muted">Avg. Order Value</p>
                <p className="mt-1 text-lg text-gold">Ksh {averageOrderValue.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Focus areas: reduce pending deliveries, improve paid-to-delivered conversion, and protect revenue quality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

