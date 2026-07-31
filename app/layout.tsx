import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

/* ============================================
   Font Configuration
   ============================================ */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ============================================
   SEO Metadata
   ============================================ */
export const metadata: Metadata = {
  title: "Kasa Kranthi Kiran — AI Systems Engineer | Portfolio",
  description:
    "Kasa Kranthi Kiran is an AI Systems Engineer building intelligent products, generative systems, and computer vision experiences. Explore projects, skills, and achievements.",
  keywords: [
    "Kasa Kranthi Kiran",
    "AI Engineer",
    "Software Engineer",
    "Full-Stack Developer",
    "Machine Learning",
    "Portfolio",
    "Computer Vision",
    "Generative AI",
    "React",
    "Next.js",
  ],
  authors: [{ name: "Kasa Kranthi Kiran" }],
  creator: "Kasa Kranthi Kiran",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Kasa Kranthi Kiran — AI Systems Engineer",
    description:
      "Building intelligent AI products, generative systems, and computer vision experiences.",
    siteName: "Kasa Kranthi Kiran Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasa Kranthi Kiran — AI Systems Engineer",
    description:
      "Building intelligent AI products, generative systems, and computer vision experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

/* ============================================
   Root Layout
   ============================================ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-body antialiased bg-background text-white`}
      >
        {children}
      </body>
    </html>
  );
}
