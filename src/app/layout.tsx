import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { HeaderCartIcon } from "@/components/HeaderCartIcon";
import { HeaderAccountLink } from "@/components/HeaderAccountLink";
import { MobileMenu } from "@/components/MobileMenu";

const bodySans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const headingSerif = Cormorant_Garamond({
  variable: "--font-heading-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "NURU ATELIER | by Skyfalke",
    template: "%s | NURU ATELIER",
  },
  description:
    "Luxury perfumes, skincare, jewelry, and curated gift experiences by NURU ATELIER.",
  keywords: [
    "best giftshop in Kenya",
    "Michaels Bouqute Kakamega",
    "Best Gift shop in Nairobi",
    "best gift shop in mombasa",
    "best gift shop in Nakuru",
    "Perfumes stores in Kenya",
    "gift shop Kenya",
    "NURU ATELIER",
  ],
  openGraph: {
    title: "NURU ATELIER",
    description: "A premium luxury commerce experience by Skyfalke.",
    type: "website",
  },
};

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/gift-customization", label: "Gift Atelier" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodySans.variable} ${headingSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
              <form className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-gold/40 bg-black px-4 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-gold/20 py-4 text-center text-xs text-muted">
            NURU ATELIER by Skyfalke. Thank you for shopping with us.
          </div>
        </footer>
      </body>
    </html>
  );
}
