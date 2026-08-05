"use client";

/* Layout Components */
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { BackToTop } from "@/components/layout/back-to-top";
import { FloatingDock } from "@/components/layout/floating-dock";
import { CommandPalette } from "@/components/layout/command-palette";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { NoiseOverlay } from "@/components/effects/noise-overlay";

/* Section Components */
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Achievements } from "@/components/sections/achievements";
import { Certifications } from "@/components/sections/certifications";
import { Education } from "@/components/sections/education";
import { Contact } from "@/components/sections/contact";

/* Data Providers */
import { PortfolioProvider } from "@/components/portfolio-provider";
import { useLivePortfolio } from "@/hooks/use-live-portfolio";

/**
 * Main portfolio page — assembles all sections with layout chrome
 */
export default function Home() {
  const { data, loading, error } = useLivePortfolio();

  if (error || (!data && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-mono">
        Error loading portfolio data. Please check your Supabase connection.
      </div>
    );
  }

  return (
    <>
      <LoadingScreen isDataLoading={loading} />
      
      {data && (
        <PortfolioProvider data={data}>
          <SmoothScrollProvider>
            {/* Custom Cursor */}
            <CustomCursor />

            {/* Noise Texture Overlay */}
            <NoiseOverlay />

            {/* Scroll Progress Bar */}
            <ScrollProgress />

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="relative">
              <Hero />
              <About />
              <Skills />
              <Experience />
              <Projects />
              <Achievements />
              <Certifications />
              <Education />
              <Contact />
            </main>

            {/* Footer */}
            <Footer />

            {/* Floating Elements */}
            <FloatingDock />
            <BackToTop />
            <CommandPalette />
          </SmoothScrollProvider>
        </PortfolioProvider>
      )}
    </>
  );
}
