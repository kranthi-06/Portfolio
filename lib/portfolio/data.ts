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

function getMediaType(url: string | null): "image" | "pdf" | "video" | "unknown" {
  if (!url) return "unknown";
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".webm") || lowerUrl.endsWith(".ogg")) return "video";
  return "image";
}

function project(item: Record<string, unknown>): Project {
  return {
    ...item,
    id: String(item.id), title: String(item.title), subtitle: item.subtitle as string | null,
    description: item.description as string | null, long_description: item.long_description as string | null,
    problem: item.problem as string | null, solution: item.solution as string | null,
    features: stringArray(item.features), technologies: stringArray(item.technologies),
    github_url: item.github_url as string | null, live_url: item.live_url as string | null,
    video_url: item.video_url as string | null, 
    media: item.image_url ? { url: item.image_url as string, publicId: item.image_public_id as string | undefined, type: "image" } : null,
    gallery_urls: stringArray(item.gallery_urls), category: item.category as string | null,
    architecture: item.architecture as string | null, challenges: stringArray(item.challenges),
    future_scope: stringArray(item.future_scope), featured: Boolean(item.featured),
    sort_order: Number(item.sort_order ?? 0), status: item.status as Project["status"],
  };
}

function certificateMap(item: Record<string, unknown>): Certificate {
  return {
    ...item,
    id: String(item.id), title: String(item.title), organization: item.organization as string | null,
    description: item.description as string | null, professional_summary: item.professional_summary as string | null,
    category: String(item.category), issue_date: item.issue_date as string | null,
    start_date: item.start_date as string | null, end_date: item.end_date as string | null,
    completion_date: item.completion_date as string | null, duration: item.duration as string | null,
    verification_url: item.verification_url as string | null,
    certificate_type: item.certificate_type as string | null, event_type: item.event_type as string | null,
    achievement: item.achievement as string | null,
    credential_id: item.credential_id as string | null, credential_url: item.credential_url as string | null,
    media: { url: String(item.file_url), publicId: item.file_public_id as string | undefined, type: getMediaType(String(item.file_url)) },
    thumbnail_url: item.thumbnail_url as string | null, skills: stringArray(item.skills),
    technologies: stringArray(item.technologies),
    tags: stringArray(item.tags), sort_order: Number(item.sort_order ?? 0),
    featured: Boolean(item.featured), metadata: (item.metadata || {}) as Record<string, unknown>,
    raw_ai_response: (item.raw_ai_response || null) as Record<string, unknown> | null,
    status: (item.status as Certificate["status"]) || "active"
  };
}

function achievementMap(item: Record<string, unknown>): Achievement {
  return {
    ...item,
    id: String(item.id), title: String(item.title), event: item.event as string | null,
    position: item.position as string | null, date: item.date as string | null,
    description: item.description as string | null, 
    media: item.image_url ? { url: String(item.image_url), type: "image" } : null,
    color: item.color as string | null, sort_order: Number(item.sort_order ?? 0)
  };
}

function eventMap(item: Record<string, unknown>): Event {
  return {
    ...item,
    id: String(item.id), name: String(item.name), description: item.description as string | null,
    summary: item.summary as string | null, organizer: item.organizer as string | null,
    location: item.location as string | null, event_date: item.event_date as string | null,
    event_type: item.event_type as string | null, achievement: item.achievement as string | null,
    prize: item.prize as string | null, highlights: stringArray(item.highlights),
    timeline_entry: item.timeline_entry as string | null, 
    media: item.cover_image_url ? { url: String(item.cover_image_url), publicId: item.cover_image_public_id as string | undefined, type: "image" } : null,
    sort_order: Number(item.sort_order ?? 0)
  };
}

function galleryMap(item: Record<string, unknown>): GalleryItem {
  return {
    ...item,
    id: String(item.id), title: item.title as string | null, caption: item.caption as string | null,
    media: { url: String(item.image_url), publicId: item.image_public_id as string | undefined, type: "image" },
    album: String(item.album), tags: stringArray(item.tags), sort_order: Number(item.sort_order ?? 0)
  };
}

function resumeMap(item: Record<string, unknown>): Resume {
  return {
    ...item,
    id: String(item.id), media: { url: String(item.file_url), publicId: item.file_public_id as string | undefined, type: "pdf" },
    file_name: String(item.file_name), file_size: item.file_size as number | null,
    version: Number(item.version ?? 1), created_at: String(item.created_at)
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
    certificates: (certificatesResult.data ?? []).map((item) => certificateMap(item as Record<string, unknown>)),
    experience: (experienceResult.data ?? []) as Experience[],
    skills: (skillsResult.data ?? []) as Skill[],
    achievements: (achievementsResult.data ?? []).map((item) => achievementMap(item as Record<string, unknown>)),
    events: (eventsResult.data ?? []).map((item) => eventMap(item as Record<string, unknown>)),
    gallery: (galleryResult.data ?? []).map((item) => galleryMap(item as Record<string, unknown>)),
    resume: resumeResult.data ? resumeMap(resumeResult.data as Record<string, unknown>) : null,
    github: (githubResult.data ?? null) as GithubStats | null,
    updatedAt: new Date().toISOString(),
  };
}
