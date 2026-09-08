import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { DemoNotice } from "@/components/layout/DemoNotice";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";

// Only the weights the design actually uses are loaded.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-barlow-condensed",
});

const inter = Inter({
  subsets: ["latin"],
  // 400 for body, 500 for buttons and .type-meta. 600 is not used anywhere,
  // so it is not downloaded.
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "David Guetta — concept preview",
    template: "%s — David Guetta (concept preview)",
  },
  description:
    "Unpublished redesign concept: shows, music and performances for David Guetta. Demo content, not an official site.",
  // The preview must not be indexed. noindex is not access control — use
  // authentication if the client needs a private preview (design.md §14).
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    siteName: "David Guetta — concept preview",
    title: "David Guetta — concept preview",
    description: "Unpublished redesign concept. Demo content, not an official site.",
  },
};

export const viewport: Viewport = {
  themeColor: "#101010",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSiteSettings();

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="type-meta sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[2px] focus:bg-signal focus:px-4 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        {settings.demoMode ? <DemoNotice /> : null}
        <Header settings={settings} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
