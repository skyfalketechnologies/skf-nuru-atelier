"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminFullscreenLoader } from "@/components/admin/AdminLoader";
import { apiGetAuth } from "@/lib/api";
import { clearAuthToken, getAuthToken, isAdminRole } from "@/lib/auth";
import { connectAdminRealtime, type RealtimeEvent } from "@/lib/realtime";
import { adminModules } from "@/lib/adminModules";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M15 18H9M16 7a4 4 0 10-8 0v3.6c0 .75-.22 1.48-.64 2.1L6 15h12l-1.36-2.3a4.16 4.16 0 01-.64-2.1V7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18a2 2 0 104 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PosIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function isModuleActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminNotification = {
  id: string;
  kind: "order_created" | "order_updated" | "inventory_updated" | "general";
  message: string;
  createdAt: string;
  href: string;
};

function buildNotification(event: RealtimeEvent): Omit<AdminNotification, "id" | "createdAt"> {
  const payload = (event.payload || {}) as {
    publicOrderId?: string;
    status?: string;
    source?: string;
    name?: string;
    stock?: number;
  };
  if (event.type === "order.created") {
    const ref = payload.publicOrderId || "new order";
    const source = payload.source === "pos" ? "POS" : "checkout";
    return {
      kind: "order_created",
      message: `${source} order created: ${ref}`,
      href: payload.publicOrderId ? `/admin/orders?q=${encodeURIComponent(payload.publicOrderId)}` : "/admin/orders",
    };
  }
  if (event.type === "order.updated") {
    const ref = payload.publicOrderId || "order";
    const status = payload.status || "updated";
    return {
      kind: "order_updated",
      message: `Order ${ref} status changed to ${status}`,
      href: payload.publicOrderId ? `/admin/orders?q=${encodeURIComponent(payload.publicOrderId)}` : "/admin/orders",
    };
  }
  if (event.type === "inventory.updated") {
    if (payload.name && typeof payload.stock === "number") {
      return {
        kind: "inventory_updated",
        message: `Inventory updated: ${payload.name} stock is now ${payload.stock}`,
        href: `/admin/inventory?q=${encodeURIComponent(payload.name)}`,
      };
    }
    if (payload.publicOrderId) {
      return {
        kind: "inventory_updated",
        message: `Inventory adjusted by order ${payload.publicOrderId}`,
        href: `/admin/orders?q=${encodeURIComponent(payload.publicOrderId)}`,
      };
    }
    return { kind: "inventory_updated", message: "Inventory updated", href: "/admin/inventory" };
  }
  return { kind: "general", message: "New admin activity", href: "/admin" };
}

function notificationKindLabel(kind: AdminNotification["kind"]) {
  if (kind === "order_created") return "NEW ORDER";
  if (kind === "order_updated") return "STATUS";
  if (kind === "inventory_updated") return "STOCK";
  return "EVENT";
}

function notificationKindClassName(kind: AdminNotification["kind"]) {
  if (kind === "order_created") return "border-emerald-500/35 bg-emerald-500/10 text-emerald-200";
  if (kind === "order_updated") return "border-sky-500/35 bg-sky-500/10 text-sky-200";
  if (kind === "inventory_updated") return "border-amber-500/35 bg-amber-500/10 text-amber-200";
  return "border-slate-500/40 bg-slate-500/10 text-slate-200";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null);
  const isLogin = pathname === "/admin/login";
  const isContentModule = pathname.startsWith("/admin/content");
  const activeModule = useMemo(
    () => adminModules.find((item) => isModuleActive(pathname, item.href)),
    [pathname]
  );

  useEffect(() => {
    if (isLogin) {
      setCheckingSession(false);
      setIsAuthorized(false);
      return;
    }
    const token = getAuthToken();
    if (!token) {
      router.replace("/admin/login");
      setCheckingSession(false);
      setIsAuthorized(false);
      return;
    }

    apiGetAuth<{ user: { role: string } }>("/api/auth/me", token)
      .then((data) => {
        if (!isAdminRole(data.user.role)) {
          clearAuthToken();
          setIsAuthorized(false);
          router.replace("/admin/login");
          return;
        }
        setIsAuthorized(true);
      })
      .catch(() => {
        clearAuthToken();
        setIsAuthorized(false);
        router.replace("/admin/login");
      })
      .finally(() => setCheckingSession(false));
  }, [isLogin, router]);

  useEffect(() => {
    if (!isAuthorized || isLogin) return () => {};
    return connectAdminRealtime(
      (event) => {
        if (!["order.created", "order.updated", "inventory.updated"].includes(event.type)) return;
        const preview = buildNotification(event);
        const notification: AdminNotification = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          kind: preview.kind,
          message: preview.message,
          createdAt: event.timestamp || new Date().toISOString(),
          href: preview.href,
        };
        setNotifications((prev) => [notification, ...prev].slice(0, 25));
        setUnreadCount((prev) => prev + 1);
      },
      setLiveConnected
    );
  }, [isAuthorized, isLogin]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    setUnreadCount(0);
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const hasRecentNotification = notifications.some((item) => Date.now() - new Date(item.createdAt).getTime() < 60000);
    const intervalMs = hasRecentNotification ? 1000 : 30000;
    const interval = window.setInterval(() => setNowMs(Date.now()), intervalMs);
    return () => window.clearInterval(interval);
  }, [isNotificationsOpen, notifications]);

  useEffect(() => {
    function onDocumentMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    }
    if (!isNotificationsOpen) return;
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, [isNotificationsOpen]);

  function formatRelativeTime(dateIso: string) {
    const then = new Date(dateIso).getTime();
    const diffSeconds = Math.max(0, Math.floor((nowMs - then) / 1000));
    if (diffSeconds < 10) return "just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  if (isLogin) return <>{children}</>;
  if (checkingSession) {
    return <AdminFullscreenLoader />;
  }
  if (!isAuthorized) return null;

  return (
    <div className="admin-shell min-h-screen">
      <AdminSidebar />
      <div className="md:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-500/30 bg-slate-950/85 backdrop-blur">
          <div
            className={`mx-auto flex items-center justify-between px-4 py-3 ${isContentModule ? "max-w-none" : "max-w-7xl"}`}
          >
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-xs text-slate-300/90">
                {activeModule ? activeModule.label : "Admin"}
              </p>
              <p className="text-[11px] text-slate-400">
                Realtime {liveConnected ? "connected" : "disconnected"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/pos")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/50 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
              >
                <PosIcon />
                POS
              </button>
              <div className="relative" ref={notificationsPanelRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((current) => !current)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-500/50 text-slate-200 hover:bg-slate-800"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-sky-400 px-1 text-[10px] font-semibold text-black">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </button>
                {isNotificationsOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-500/40 bg-slate-950/95 p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Notifications</p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setUnreadCount(0)}
                          className="text-[11px] text-slate-300 hover:text-white"
                        >
                          Mark all read
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifications([]);
                            setUnreadCount(0);
                          }}
                          className="text-[11px] text-slate-300 hover:text-white"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {notifications.length ? (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              router.push(item.href);
                              setIsNotificationsOpen(false);
                            }}
                            className="w-full rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-left hover:border-slate-500/80"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${notificationKindClassName(item.kind)}`}>
                                {notificationKindLabel(item.kind)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-100">{item.message}</p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatRelativeTime(item.createdAt)} · {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </button>
                        ))
                      ) : (
                        <p className="rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/50 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
              >
                <HomeIcon />
                Overview
              </button>
            </div>
          </div>
        </header>
        <main
          className={`mx-auto px-4 py-6 sm:px-6 ${isContentModule ? "max-w-none w-full" : "max-w-7xl"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

