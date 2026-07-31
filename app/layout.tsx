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
  title: "Rahul Bariki — AI Systems Engineer | Portfolio",
  description:
    "Rahul Bariki is an AI Systems Engineer building intelligent products, generative systems, and computer vision experiences. Explore projects, skills, and achievements.",
  keywords: [
    "Rahul Bariki",
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
  authors: [{ name: "Rahul Bariki" }],
  creator: "Rahul Bariki",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Rahul Bariki — AI Systems Engineer",
    description:
      "Building intelligent AI products, generative systems, and computer vision experiences.",
    siteName: "Rahul Bariki Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rahul Bariki — AI Systems Engineer",
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
