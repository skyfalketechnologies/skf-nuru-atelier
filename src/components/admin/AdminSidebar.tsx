"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <aside className="sticky top-16 z-10 border-b border-gold/25 bg-black/95 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
                  active
                    ? "bg-gold text-black"
                    : "border border-gold/40 text-muted hover:bg-gold/10 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              clearAuthToken();
              router.push("/admin/login");
            }}
            className="whitespace-nowrap rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:bg-gold/10"
          >
            Sign out
          </button>
        </div>
      </aside>
      <aside className="hidden md:fixed md:left-0 md:top-16 md:z-10 md:block md:h-[calc(100vh-4rem)] md:w-72 md:border-r md:border-gold/25 md:bg-black/95">
        <div className="flex h-full flex-col overflow-y-auto p-5">
        <div className="mb-8 border-b border-gold/25 pb-4">
          <p className="text-xs tracking-[0.2em] text-gold/70">NURU ATELIER</p>
          <h2 className="mt-1 font-serif text-2xl text-gold">Admin Portal</h2>
          <p className="mt-1 text-xs text-muted">Operations Console</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gold text-black"
                    : "text-muted hover:bg-gold/10 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            clearAuthToken();
            router.push("/admin/login");
          }}
          className="mt-auto rounded-lg border border-gold/40 px-3 py-2 text-left text-sm text-gold hover:bg-gold/10"
        >
          Sign out
        </button>
        </div>
      </aside>
    </>
  );
}

