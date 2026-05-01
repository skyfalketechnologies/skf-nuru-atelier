"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Toast } from "@/components/admin/Toast";

type TrendPoint = { date: string; revenueKes: number; orders: number };
type Bucket = { status: string; count: number };
type Kpis = {
  revenueKes: number;
  aovKes: number;
  conversionProxyPct: number;
  paidOrders: number;
  totalOrders: number;
};
type TopProduct = { name: string; units: number; revenueKes: number };

export default function AdminAnalyticsPage() {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [message, setMessage] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  async function loadAnalytics() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setMessage("Admin login required.");
      setToastTone("error");
      setLoading(false);
      return;
    }
    await Promise.all([
      apiGetAuth<{ points: TrendPoint[] }>("/api/admin/analytics/revenue-trend", token),
      apiGetAuth<{ buckets: Bucket[] }>("/api/admin/analytics/status-distribution", token),
      apiGetAuth<{ kpis: Kpis; topProducts: TopProduct[] }>("/api/admin/analytics/kpis", token),
    ])
      .then(([trendData, bucketData, kpiData]) => {
        setTrend(trendData.points.slice(-10));
        setBuckets(bucketData.buckets);
        setKpis(kpiData.kpis);
        setTopProducts(kpiData.topProducts);
      })
      .catch(() => {
        setMessage("Unable to load analytics.");
        setToastTone("error");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxRevenue = useMemo(() => Math.max(...trend.map((p) => p.revenueKes), 1), [trend]);
  const maxCount = useMemo(() => Math.max(...buckets.map((b) => b.count), 1), [buckets]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-serif text-2xl text-gold sm:text-3xl">Analytics</h1>
      {message && !loading ? (
        <div className="mt-2 flex items-center gap-3 text-sm text-muted">
          <span>{message}</span>
          <button
            className="text-gold underline"
            onClick={() => {
              void loadAnalytics();
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {loading ? <div className="h-24 animate-pulse rounded border border-gold/20 bg-white/5 lg:col-span-2" /> : null}
        <div className="luxury-card rounded-xl p-4 lg:col-span-2">
          <h2 className="text-sm text-gold">KPI Snapshot</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <div className="rounded border border-gold/30 p-2">Revenue: Ksh {Math.round(kpis?.revenueKes ?? 0).toLocaleString()}</div>
            <div className="rounded border border-gold/30 p-2">AOV: Ksh {Math.round(kpis?.aovKes ?? 0).toLocaleString()}</div>
            <div className="rounded border border-gold/30 p-2">
              Conversion proxy: {(kpis?.conversionProxyPct ?? 0).toFixed(1)}%
            </div>
            <div className="rounded border border-gold/30 p-2">Paid orders: {kpis?.paidOrders ?? 0}</div>
            <div className="rounded border border-gold/30 p-2">Total orders: {kpis?.totalOrders ?? 0}</div>
          </div>
        </div>
        <div className="luxury-card rounded-xl p-4">
          <h2 className="text-sm text-gold">Revenue Trend (recent days)</h2>
          <div className="mt-4 space-y-2">
            {trend.map((point) => (
              <div key={point.date} className="text-xs">
                <div className="mb-1 flex items-center justify-between text-muted">
                  <span>{point.date}</span>
                  <span>Ksh {point.revenueKes.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded bg-white/10">
                  <div
                    className="h-2 rounded bg-gold"
                    style={{ width: `${Math.max((point.revenueKes / maxRevenue) * 100, 3)}%` }}
                  />
                </div>
              </div>
            ))}
            {!trend.length ? <p className="text-xs text-muted">No revenue data yet.</p> : null}
          </div>
        </div>

        <div className="luxury-card rounded-xl p-4">
          <h2 className="text-sm text-gold">Order Status Distribution</h2>
          <div className="mt-4 space-y-3">
            {buckets.map((bucket) => (
              <div key={bucket.status} className="text-xs">
                <div className="mb-1 flex items-center justify-between text-muted">
                  <span>{bucket.status}</span>
                  <span>{bucket.count}</span>
                </div>
                <div className="h-2 rounded bg-white/10">
                  <div
                    className="h-2 rounded bg-gold/90"
                    style={{ width: `${Math.max((bucket.count / maxCount) * 100, 5)}%` }}
                  />
                </div>
              </div>
            ))}
            {!buckets.length ? <p className="text-xs text-muted">No orders yet.</p> : null}
          </div>
        </div>
        <div className="luxury-card rounded-xl p-4 lg:col-span-2">
          <h2 className="text-sm text-gold">Top Products by Revenue</h2>
          <div className="mt-3 space-y-2 text-sm">
            {topProducts.map((product) => (
              <div key={product.name} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gold/30 p-2">
                <span>{product.name}</span>
                <span>{product.units} units</span>
                <span>Ksh {product.revenueKes.toLocaleString()}</span>
              </div>
            ))}
            {!topProducts.length ? <p className="text-muted">No product sales data yet.</p> : null}
          </div>
        </div>
      </div>
      {message ? <Toast message={message} tone={toastTone} onClose={() => setMessage("")} /> : null}
    </section>
  );
}

