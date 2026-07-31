import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasa Kranthi Kiran — AI Systems Engineer",
  description:
    "Building intelligent products that shape the future. AI systems engineer, product builder, and full-stack developer.",
  keywords: [
    "Kasa Kranthi Kiran",
    "AI Systems Engineer",
    "AI Developer",
    "Full Stack Developer",
    "Machine Learning",
    "Product Builder",
  ],
  authors: [{ name: "Kasa Kranthi Kiran" }],
  creator: "Kasa Kranthi Kiran",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Kasa Kranthi Kiran — AI Systems Engineer",
    description: "Building intelligence people actually want to use.",
    siteName: "Kasa Kranthi Kiran",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasa Kranthi Kiran — AI Systems Engineer",
    description: "Building intelligence people actually want to use.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
