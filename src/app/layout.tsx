import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { FacebookPixel } from "@/components/FacebookPixel";
import { FacebookPixelRouteTracker } from "@/components/FacebookPixelRouteTracker";
import { GtmRouteChangeTracker } from "@/components/GtmRouteChangeTracker";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import { SiteChrome } from "@/components/SiteChrome";

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
    default: "NURU ATELIER",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodySans.variable} ${headingSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GoogleTagManager />
        <FacebookPixel />
        <GtmRouteChangeTracker />
        <FacebookPixelRouteTracker />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
