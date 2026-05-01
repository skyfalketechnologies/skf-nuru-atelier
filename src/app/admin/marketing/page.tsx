"use client";

import { useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

const channels = [
  { name: "Meta Ads", spendKes: 240000, roas: 3.6, status: "Healthy" },
  { name: "Google Search", spendKes: 110000, roas: 4.1, status: "Healthy" },
  { name: "Email Automation", spendKes: 26000, roas: 8.7, status: "Scale" },
];

export default function AdminMarketingPage() {
  const [subscribers, setSubscribers] = useState<
    Array<{ _id: string; email: string; source?: string; isActive: boolean; createdAt: string }>
  >([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  async function loadSubscribers() {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      if (query.trim()) params.set("q", query.trim());
      const data = await apiGetAuth<{
        subscribers: Array<{ _id: string; email: string; source?: string; isActive: boolean; createdAt: string }>;
        summary: { activeCount: number; inactiveCount: number };
      }>(`/api/subscriptions/admin/all?${params.toString()}`, token);
      setSubscribers(data.subscribers || []);
      setActiveCount(data.summary?.activeCount ?? 0);
      setInactiveCount(data.summary?.inactiveCount ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  async function exportSubscribersCsv() {
    const token = getAuthToken();
    if (!token) return;
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      if (query.trim()) params.set("q", query.trim());
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/subscriptions/admin/export.csv?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "subscribers.csv";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold/70">Marketing Command</p>
        <h1 className="mt-1 font-serif text-2xl text-gold">Channel Performance</h1>
        <p className="mt-2 text-sm text-muted">
          Coordinate paid and owned channels using performance snapshots and target pacing.
        </p>
      </div>
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Channel Mix</h2>
        <div className="mt-3 space-y-2">
          {channels.map((channel) => (
            <div key={channel.name} className="rounded-lg border border-gold/20 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>{channel.name}</p>
                <p className="text-gold">{channel.status}</p>
              </div>
              <p className="mt-1 text-xs text-muted">
                Spend: Ksh {channel.spendKes.toLocaleString()} | ROAS: {channel.roas.toFixed(1)}x
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gold/25 bg-black/35 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm uppercase tracking-[0.14em] text-gold/80">Email Subscribers</h2>
          <p className="text-xs text-muted">
            Active: <span className="text-emerald-200">{activeCount}</span> · Inactive:{" "}
            <span className="text-amber-100">{inactiveCount}</span>
          </p>
        </div>
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email..."
            className="rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "all")}
            className="rounded-lg border border-gold/30 bg-black/30 px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
          <button
            type="button"
            onClick={() => {
              void loadSubscribers();
            }}
            className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={exportSubscribersCsv}
            disabled={exporting}
            className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-muted">Loading subscribers...</p>
        ) : subscribers.length ? (
          <div className="space-y-2">
            {subscribers.map((subscriber) => (
              <div key={subscriber._id} className="rounded-lg border border-gold/20 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-foreground">{subscriber.email}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      subscriber.isActive
                        ? "border border-emerald-500/35 text-emerald-200"
                        : "border border-amber-500/35 text-amber-100"
                    }`}
                  >
                    {subscriber.isActive ? "active" : "inactive"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Source: {subscriber.source || "website_footer"} · Joined:{" "}
                  {new Date(subscriber.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No subscribers found.</p>
        )}
      </div>
    </section>
  );
}
