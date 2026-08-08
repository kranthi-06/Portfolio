"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Navigation } from "@/components/layout/navigation";
import { ScrollProgress, SiteFooter } from "@/components/layout/footer";
import { LandingSection } from "@/components/sections/landing";
import { PhilosophySection } from "@/components/sections/philosophy";
import { ExperienceSection } from "@/components/sections/experience-section";
import { JourneySection } from "@/components/sections/journey";
import { ProductsSection } from "@/components/sections/products";
import { PlaygroundSection } from "@/components/sections/playground";
import { CertificationsSection } from "@/components/sections/certifications";
import { BeyondTheCodeSection } from "@/components/sections/beyond-the-code";
import { GitHubSection } from "@/components/sections/github-dashboard";
import { WhatsNextSection } from "@/components/sections/whats-next";
import { CollaborateSection } from "@/components/sections/collaborate";

/* Data Providers */
import { PortfolioProvider } from "@/components/portfolio-provider";
import { useLivePortfolio } from "@/hooks/use-live-portfolio";

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
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="w-12 h-12 border-t-2 border-r-2 border-white rounded-full animate-spin mb-4" />
          <p className="text-white font-mono text-sm tracking-widest uppercase">Initializing</p>
        </div>
      )}

      {data && (
        <PortfolioProvider data={data}>
          <ThemeProvider>
            <SmoothScroll>
              <ScrollProgress />
              <Navigation />
              <main>
                <LandingSection />
                <PhilosophySection />
                <PlaygroundSection />
                <ExperienceSection />
                <JourneySection />
                <ProductsSection />
                <CertificationsSection />
                <BeyondTheCodeSection />
                <GitHubSection />
                <WhatsNextSection />
                <CollaborateSection />
              </main>
              <SiteFooter />
            </SmoothScroll>
          </ThemeProvider>
        </PortfolioProvider>
      )}
    </>
  );
}
