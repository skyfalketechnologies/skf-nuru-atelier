"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HeaderCartIcon } from "@/components/HeaderCartIcon";
import { HeaderAccountLink } from "@/components/HeaderAccountLink";

type NavLink = {
  href: string;
  label: string;
};

export function MobileMenu({ links }: { links: ReadonlyArray<NavLink> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-black/60 text-gold transition hover:bg-gold/10"
      >
        <span className="relative block h-4 w-5">
          <span
            className={`absolute left-0 top-0 block h-[1.5px] w-5 bg-current transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] block h-[1.5px] w-5 bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[14px] block h-[1.5px] w-5 bg-current transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-gold/30 bg-black/95 p-3 shadow-2xl backdrop-blur">
          <div className="mb-2 border-b border-gold/20 px-3 pb-2">
            <p className="text-[11px] tracking-[0.2em] text-gold/80">MENU</p>
          </div>
          <div className="grid gap-1 text-sm text-muted">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-gold/10 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-2 border-t border-gold/20 pt-2">
            <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted hover:bg-gold/10 hover:text-gold">
              <HeaderAccountLink />
            </div>
            <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted hover:bg-gold/10 hover:text-gold">
              <HeaderCartIcon />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
