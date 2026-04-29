import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
  openGraph: {
    title: "NURU ATELIER",
    description: "A premium luxury commerce experience by Skyfalke.",
    type: "website",
  },
};

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
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
          <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="font-serif text-xl tracking-[0.2em] text-gold">
              NURU ATELIER
              <span className="ml-2 text-xs text-muted">by Skyfalke</span>
            </Link>
            <div className="flex items-center gap-5 text-sm text-muted">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-gold">
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" className="gold-border rounded-full px-4 py-1 text-gold hover:bg-gold/10">
                Cart
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gold/30 py-8 text-center text-xs text-muted">
          NURU ATELIER by Skyfalke. Crafted in elegance.
        </footer>
      </body>
    </html>
  );
}
