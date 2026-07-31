import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["400", "500", "600", "700"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Kranthi Kiran — Generative AI Developer",
  description: "The personal site of Kranthi Kiran, an AI and full-stack developer building useful intelligent products.",
  keywords: ["Kranthi Kiran", "Generative AI Developer", "Full Stack Developer", "AI Builder", "Software Engineer"],
  authors: [{ name: "Kranthi Kiran" }],
  openGraph: { type: "website", locale: "en_IN", title: "Kranthi Kiran — Generative AI Developer", description: "Making AI feel useful." },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#f6f5f2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>{children}</body></html>;
}
