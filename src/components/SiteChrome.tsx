"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { HeaderCartIcon } from "@/components/HeaderCartIcon";
import { HeaderAccountLink } from "@/components/HeaderAccountLink";
import { MobileMenu } from "@/components/MobileMenu";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/gift-customization", label: "Gift Atelier" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribeTone, setSubscribeTone] = useState<"success" | "error" | "info">("info");

  async function submitSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = subscriberEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setSubscribeMessage("Enter your email to subscribe.");
      setSubscribeTone("error");
      return;
    }
    setSubscribing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, source: "website_footer" }),
      });
      if (!response.ok) throw new Error("Subscription failed");
      const data = (await response.json()) as { alreadySubscribed?: boolean };
      if (data.alreadySubscribed) {
        setSubscribeMessage("You are already subscribed to our updates.");
        setSubscribeTone("info");
      } else {
        setSubscribeMessage("Thanks for subscribing. Watch your inbox for updates.");
        setSubscribeTone("success");
      }
      setSubscriberEmail("");
    } catch {
      setSubscribeMessage("Subscription failed. Please try again.");
      setSubscribeTone("error");
    } finally {
      setSubscribing(false);
    }
  }

  if (isAdminRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-gold/30 bg-black/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="font-serif text-base tracking-[0.16em] text-gold sm:text-xl sm:tracking-[0.2em]">
            NURU ATELIER
          </Link>
          <div className="hidden items-center gap-5 text-sm text-muted sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gold">
                {link.label}
              </Link>
            ))}
            <HeaderAccountLink />
            <HeaderCartIcon />
          </div>

          <MobileMenu links={links} />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gold/30">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <p className="font-serif text-lg tracking-[0.14em] text-gold">NURU ATELIER</p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Good perfumes, body care, and gift options made with quality and style.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted">
              <img
                src="https://flagcdn.com/w40/ke.png"
                alt="Kenya flag"
                className="h-4 w-6 rounded-[2px] object-cover"
              />
              <span>Kenya</span>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.22em] text-gold">SHOP & BRAND</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/shop" className="hover:text-gold">Shop All</Link></li>
              <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
              <li><Link href="/gift-customization" className="hover:text-gold">Gift Atelier</Link></li>
              <li><Link href="/about" className="hover:text-gold">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[0.22em] text-gold">CUSTOMER CARE</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/cart" className="hover:text-gold">Cart & Checkout</Link></li>
              <li><Link href="/track-order" className="hover:text-gold">Track Your Order</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-gold">Shipping & Returns</Link></li>
              <li><Link href="/help-center" className="hover:text-gold">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[0.22em] text-gold">EXCLUSIVE UPDATES</p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Join our email list for offers, new products, and updates.
            </p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={submitSubscription}>
              <input
                type="email"
                placeholder="Enter your email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                disabled={subscribing}
                className="w-full rounded-full border border-gold/40 bg-black px-4 py-2 text-sm text-foreground placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {subscribeMessage ? (
              <p
                className={`mt-2 text-xs ${
                  subscribeTone === "success"
                    ? "text-emerald-200"
                    : subscribeTone === "error"
                    ? "text-red-300"
                    : "text-sky-200"
                }`}
              >
                {subscribeMessage}
              </p>
            ) : null}
          </div>
        </div>
        <div className="border-t border-gold/20 py-4 text-center text-xs text-muted">
          NURU ATELIER by Skyfalke. Thank you for shopping with us.
        </div>
      </footer>
    </>
  );
}
