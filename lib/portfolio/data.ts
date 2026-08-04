import "server-only";

import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type {
  Achievement,
  Certificate,
  CounterSettings,
  Event,
  Experience,
  GalleryItem,
  GithubStats,
  PortfolioData,
  ProfileSettings,
  Project,
  Resume,
  SeoSettings,
  Skill,
  SocialLinks,
} from "@/lib/portfolio/types";

type SettingRow = { key: string; value: unknown };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringRecord(value: unknown): SocialLinks {
  return Object.fromEntries(Object.entries(record(value)).filter(([, item]) => typeof item === "string")) as SocialLinks;
}

function counters(value: unknown): CounterSettings {
  return Object.fromEntries(
    Object.entries(record(value)).filter(([, item]) => typeof item === "string" || typeof item === "number"),
  ) as CounterSettings;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function project(item: Record<string, unknown>): Project {
  return {
    ...item,
    id: String(item.id), title: String(item.title), subtitle: item.subtitle as string | null,
    description: item.description as string | null, long_description: item.long_description as string | null,
    problem: item.problem as string | null, solution: item.solution as string | null,
    features: stringArray(item.features), technologies: stringArray(item.technologies),
    github_url: item.github_url as string | null, live_url: item.live_url as string | null,
    video_url: item.video_url as string | null, image_url: item.image_url as string | null,
    gallery_urls: stringArray(item.gallery_urls), category: item.category as string | null,
    architecture: item.architecture as string | null, challenges: stringArray(item.challenges),
    future_scope: stringArray(item.future_scope), featured: Boolean(item.featured),
    sort_order: Number(item.sort_order ?? 0), status: item.status as Project["status"],
  };
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) throw new Error("The public Supabase configuration is missing.");

  const [settingsResult, projectsResult, certificatesResult, experienceResult, skillsResult, achievementsResult, eventsResult, galleryResult, resumeResult, githubResult] = await Promise.all([
    supabase.from("settings").select("key,value"),
    supabase.from("projects").select("*").order("featured", { ascending: false }).order("sort_order", { ascending: true }),
    supabase.from("certificates").select("*").order("sort_order", { ascending: true }),
    supabase.from("experience").select("*").order("sort_order", { ascending: true }),
    supabase.from("skills").select("*").order("sort_order", { ascending: true }),
    supabase.from("achievements").select("*").order("sort_order", { ascending: true }),
    supabase.from("events").select("*").order("sort_order", { ascending: true }),
    supabase.from("gallery").select("*").order("sort_order", { ascending: true }),
    supabase.from("resume").select("*").eq("is_active", true).order("version", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("github_stats").select("*").order("fetched_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const results = [settingsResult, projectsResult, certificatesResult, experienceResult, skillsResult, achievementsResult, eventsResult, galleryResult, resumeResult, githubResult];
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;

  const settings = Object.fromEntries(((settingsResult.data ?? []) as SettingRow[]).map((item) => [item.key, item.value]));

  return {
    profile: record(settings.profile) as ProfileSettings,
    socialLinks: stringRecord(settings.social_links),
    counters: counters(settings.counters),
    seo: { ...record(settings.seo), keywords: stringArray(record(settings.seo).keywords) } as SeoSettings,
    projects: (projectsResult.data ?? []).map((item) => project(item as Record<string, unknown>)),
    certificates: (certificatesResult.data ?? []) as Certificate[],
    experience: (experienceResult.data ?? []) as Experience[],
    skills: (skillsResult.data ?? []) as Skill[],
    achievements: (achievementsResult.data ?? []) as Achievement[],
    events: (eventsResult.data ?? []) as Event[],
    gallery: (galleryResult.data ?? []) as GalleryItem[],
    resume: (resumeResult.data ?? null) as Resume | null,
    github: (githubResult.data ?? null) as GithubStats | null,
    updatedAt: new Date().toISOString(),
  };
}
