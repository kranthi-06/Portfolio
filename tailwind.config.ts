import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        "background-elevated": "var(--bg-elevated)",
        "background-subtle": "var(--bg-subtle)",
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        gradient: {
          1: "var(--gradient-1)",
          2: "var(--gradient-2)",
          3: "var(--gradient-3)",
        },
        primary: {
          DEFAULT: "#6C63FF",
          50: "#F0EFFF",
          100: "#D9D7FF",
          200: "#B3AEFF",
          300: "#8D86FF",
          400: "#6C63FF",
          500: "#5046E5",
          600: "#3A33CC",
          700: "#2A24B3",
          800: "#1E1A99",
          900: "#141280",
        },
        secondary: {
          DEFAULT: "#00D4FF",
          50: "#E0F9FF",
          100: "#B3F1FF",
          200: "#80E8FF",
          300: "#4DDFFF",
          400: "#00D4FF",
          500: "#00B8E6",
          600: "#009CCC",
          700: "#0080B3",
          800: "#006499",
          900: "#004880",
        },
        accent: {
          DEFAULT: "#A855F7",
          50: "#F3E8FE",
          100: "#E9D5FD",
          200: "#D8B4FE",
          300: "#C084FC",
          400: "#A855F7",
          500: "#9333EA",
          600: "#7E22CE",
          700: "#6B21A8",
          800: "#581C87",
          900: "#3B0764",
        },
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "gradient": "gradient 8s ease infinite",
        "gradient-slow": "gradient 15s ease infinite",
        "shimmer": "shimmer 2s linear infinite",
        "reveal-up": "reveal-up 0.7s ease-out forwards",
        "reveal-down": "reveal-down 0.7s ease-out forwards",
        "spin-slow": "spin 8s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "aurora": "aurora 8s ease infinite",
        "blob": "blob 7s infinite",
        "border-spin": "border-spin 4s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "typewriter": "typewriter 4s steps(40) infinite",
        "blink": "blink 1s step-end infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(108, 99, 255, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(108, 99, 255, 0.6)" },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-down": {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        aurora: {
          "0%": { backgroundPosition: "50% 50%", backgroundSize: "300% 300%" },
          "25%": { backgroundPosition: "0% 50%", backgroundSize: "200% 200%" },
          "50%": { backgroundPosition: "100% 50%", backgroundSize: "400% 400%" },
          "75%": { backgroundPosition: "50% 100%", backgroundSize: "200% 200%" },
          "100%": { backgroundPosition: "50% 50%", backgroundSize: "300% 300%" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "border-spin": {
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #6C63FF 0%, #00D4FF 50%, #A855F7 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)",
        "border-gradient": "linear-gradient(135deg, #6C63FF, #00D4FF, #A855F7)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108, 99, 255, 0.3)",
        "glow-lg": "0 0 40px rgba(108, 99, 255, 0.4)",
        "glow-secondary": "0 0 20px rgba(0, 212, 255, 0.3)",
        "glow-accent": "0 0 20px rgba(168, 85, 247, 0.3)",
        card: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 16px 48px rgba(0, 0, 0, 0.4)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};

export default config;
