import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getPortfolioData } from "@/lib/portfolio/data";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["400", "500", "600", "700"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"], display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: ["400"], style: ["normal", "italic"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { title: "Kasa Kranthi Kiran | Portfolio", robots: { index: true, follow: true } };
  }
  try {
    const portfolio = await getPortfolioData();
    const title = portfolio.seo.title && portfolio.seo.title !== "Portfolio" ? portfolio.seo.title : "Kasa Kranthi Kiran | Portfolio";
    const description = portfolio.seo.description || portfolio.profile.headline || portfolio.profile.tagline || portfolio.profile.bio;
    return {
      title,
      description,
      keywords: portfolio.seo.keywords,
      authors: portfolio.profile.name ? [{ name: portfolio.profile.name }] : undefined,
      creator: portfolio.profile.name,
      openGraph: { type: "website", title, description, siteName: portfolio.profile.name },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Kasa Kranthi Kiran | Portfolio", robots: { index: true, follow: true } };
  }
}

export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf9f7" }, { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" }], width: "device-width", initialScale: 1 };

import { AnalyticsTracker } from "@/components/analytics/tracker";
import { Suspense } from "react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}>
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
