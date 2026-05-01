"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { adminModules } from "@/lib/adminModules";

function DotIcon() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden />;
}

function isModuleActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const moduleGroups = ["Commerce", "Growth", "Operations", "System"] as const;
  const groupedModules = moduleGroups.map((group) => ({
    group,
    items: adminModules.filter((item) => item.group === group),
  }));

  return (
    <>
      <aside className="sticky top-[57px] z-30 border-b border-slate-500/30 bg-slate-950/95 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {adminModules.map((item) => {
            const active = isModuleActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
                  active
                    ? "bg-sky-500/25 text-sky-100"
                    : "border border-slate-500/50 text-slate-300 hover:border-sky-400/60 hover:text-sky-100"
                }`}
              >
                <DotIcon />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              clearAuthToken();
              router.push("/admin/login");
            }}
            className="whitespace-nowrap rounded-full border border-slate-500/50 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </aside>
      <aside className="hidden md:fixed md:left-0 md:top-0 md:z-30 md:block md:h-screen md:w-72 md:border-r md:border-slate-500/30 md:bg-slate-950/95">
        <div className="flex h-full flex-col overflow-y-auto p-5">
          <div className="mb-6 border-b border-slate-500/30 pb-4">
            <Link
              href="/"
              className="font-serif text-base tracking-[0.16em] text-gold sm:text-xl sm:tracking-[0.2em]"
            >
              NURU ATELIER
            </Link>
            <h2 className="mt-1 font-serif text-2xl text-slate-100">Admin Panel</h2>
          </div>

          <nav className="space-y-5">
            {groupedModules.map((section) => (
              <div key={section.group}>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{section.group}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isModuleActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                          active
                            ? "bg-sky-500/25 text-sky-100"
                            : "text-slate-300 hover:bg-slate-800 hover:text-sky-100"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <DotIcon />
                          {item.label}
                        </span>
                        {item.status === "beta" ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-sky-950/40 text-sky-100" : "border border-slate-500/50 text-slate-300"}`}>
                            Beta
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <button
            onClick={() => {
              clearAuthToken();
              router.push("/admin/login");
            }}
            className="mt-auto rounded-lg border border-slate-500/50 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

