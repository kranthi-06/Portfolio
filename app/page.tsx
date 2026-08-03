"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Navigation } from "@/components/layout/navigation";
import { ScrollProgress, SiteFooter } from "@/components/layout/footer";
import { LandingSection } from "@/components/sections/landing";
import { PhilosophySection } from "@/components/sections/philosophy";
import { JourneySection } from "@/components/sections/journey";
import { ProductsSection } from "@/components/sections/products";
import { PlaygroundSection } from "@/components/sections/playground";
import { AchievementsSection } from "@/components/sections/achievements";
import { CertificationsSection } from "@/components/sections/certifications";
import { GitHubSection } from "@/components/sections/github-dashboard";
import { WhatsNextSection } from "@/components/sections/whats-next";
import { CollaborateSection } from "@/components/sections/collaborate";

export default function Home() {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <ScrollProgress />
        <Navigation />
        <main>
          <LandingSection />
          <PhilosophySection />
          <JourneySection />
          <ProductsSection />
          <PlaygroundSection />
          <AchievementsSection />
          <CertificationsSection />
          <GitHubSection />
          <WhatsNextSection />
          <CollaborateSection />
        </main>
        <SiteFooter />
      </SmoothScroll>
    </ThemeProvider>
  );
}
