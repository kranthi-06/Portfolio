import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["400", "500", "600", "700"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Kasa Kranthi Kiran — AI Engineer & Product Builder",
  description: "The personal site of Kasa Kranthi Kiran, building considered AI experiences and full-stack products.",
  keywords: ["Kasa Kranthi Kiran", "AI Engineer", "Product Builder", "Full Stack Developer", "Software Engineer"],
  authors: [{ name: "Kasa Kranthi Kiran" }],
  openGraph: { type: "website", locale: "en_IN", title: "Kasa Kranthi Kiran — AI Engineer & Product Builder", description: "Making AI feel useful." },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#f6f5f2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>{children}</body></html>;
}
