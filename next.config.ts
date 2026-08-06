import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "tesseract.js"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wepflhbhesqemfoamvsl.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },

    ],
  },
};

export default nextConfig;
