"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import type { PortfolioData } from "@/lib/portfolio/types";

// Import UI Primitives
import { SkeletonPage } from "./ui/premium-skeleton";

// Import Sections
import { Header } from "./sections/header";
import { Hero } from "./sections/hero";
import { Projects } from "./sections/projects";
import { About } from "./sections/about";
import { ExperienceSection } from "./sections/experience";
import { Skills } from "./sections/skills";
import { Certificates } from "./sections/certificates";
import { Achievements } from "./sections/achievements";
import { Events } from "./sections/events";
import { Gallery } from "./sections/gallery";
import { ResumeSection } from "./sections/resume";
import { Contact } from "./sections/contact";
import { Footer } from "./sections/footer";

type LoadState = { data: PortfolioData | null; loading: boolean; error: string | null };
const tableNames = ["settings", "projects", "certificates", "experience", "skills", "achievements", "events", "gallery", "resume", "github_stats"];

function useLivePortfolio() {
  const [state, setState] = useState<LoadState>({ data: null, loading: true, error: null });

  const load = useCallback(async (quiet = false, fresh = false) => {
    if (!quiet) setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await fetch(fresh ? `/api/portfolio?refresh=${Date.now()}` : "/api/portfolio", { cache: "no-store" });
      const payload = await response.json() as PortfolioData & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to load the portfolio.");
      setState({ data: payload, loading: false, error: null });
    } catch (error) {
      setState((current) => ({ data: current.data, loading: false, error: error instanceof Error ? error.message : "Unable to load the portfolio." }));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const subscribe = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key || cancelled) return;
      const { createClient } = await import("@supabase/supabase-js");
      if (cancelled) return;
      const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const refresh = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { void load(true, true); }, 250);
      };
      const channel = client.channel("portfolio-live-content");
      tableNames.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh));
      channel.subscribe();
      cleanup = () => { if (timer) clearTimeout(timer); void client.removeChannel(channel); };
    };

    void subscribe();
    return () => { cancelled = true; cleanup?.(); };
  }, [load]);

  return { ...state, retry: () => load(false, true) };
}

function ProgressLine() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => setProgress(window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));
    update(); 
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none" aria-hidden="true">
      <div 
        className="h-full bg-gradient-to-r from-gradient-1 via-gradient-2 to-gradient-3 transform-gpu origin-left"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

function Site({ data }: { data: PortfolioData }) {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <ProgressLine />
        <Header profile={data.profile} socialLinks={data.socialLinks} />
        <main>
          <Hero data={data} />
          <Projects items={data.projects} />
          <About data={data} />
          <ExperienceSection data={data} />
          <Skills items={data.skills} />
          <Certificates items={data.certificates} />
          <Achievements items={data.achievements} />
          <Events items={data.events} />
          <Gallery items={data.gallery} />
          <ResumeSection resume={data.resume} />
          <Contact data={data} />
        </main>
        <Footer profile={data.profile} socialLinks={data.socialLinks} />
      </SmoothScroll>
    </ThemeProvider>
  );
}

export function PortfolioApp() {
  const { data, loading, error, retry } = useLivePortfolio();

  if (!data && loading) return <SkeletonPage />;
  
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center p-12 glass-card rounded-3xl">
        <Sparkles size={48} className="mx-auto mb-6 text-gradient-1 opacity-50" />
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-4">Portfolio unavailable</h1>
        <p className="text-ink-secondary mb-8 leading-relaxed">
          {error ?? "The live portfolio data could not be loaded."}
        </p>
        <button 
          onClick={retry}
          className="px-6 py-3 rounded-full bg-ink text-background font-semibold hover:scale-105 transition-transform"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return (
    <>
      {error && (
        <button 
          className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-ink text-background text-xs font-bold shadow-2xl hover:scale-105 transition-transform" 
          onClick={retry}
        >
          Live updates paused — retry
        </button>
      )}
      <Site data={data} />
    </>
  );
}
