import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, withApiAuth } from "@/lib/server/api-utils";

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient();

  // Fetch all counts in parallel
  const [
    projectsRes,
    certificatesRes,
    eventsRes,
    achievementsRes,
    galleryRes,
    skillsRes,
    experienceRes,
    messagesRes,
    analyticsRes,
    settingsRes,
    recentLogsRes,
    mediaRes,
  ] = await Promise.all([
    supabase.from("projects").select("id, status", { count: "exact", head: true }),
    supabase.from("certificates").select("id, category", { count: "exact" }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("achievements").select("id", { count: "exact", head: true }),
    supabase.from("gallery").select("id", { count: "exact", head: true }),
    supabase.from("skills").select("id", { count: "exact", head: true }),
    supabase.from("experience").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id, status", { count: "exact" }),
    supabase.from("visitor_analytics").select("id", { count: "exact", head: true }),
    supabase.from("settings").select("key, value").eq("key", "counters").single(),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("media").select("file_size"),
  ]);

  // Calculate certificate subcounts
  const certificates = certificatesRes.data || [];
  const certCounts = {
    total: certificatesRes.count || 0,
    internships: certificates.filter((c) => c.category === "Internship").length,
    workshops: certificates.filter((c) => c.category === "Workshop").length,
    courses: certificates.filter((c) => c.category === "Course").length,
  };

  // Calculate storage usage
  const mediaFiles = mediaRes.data || [];
  const storageUsed = mediaFiles.reduce((sum, f) => sum + (f.file_size || 0), 0);

  // Get unread messages count
  const messages = messagesRes.data || [];
  const unreadMessages = messages.filter((m) => m.status === "unread").length;

  // Counters from settings
  const counters = (settingsRes.data?.value as Record<string, number>) || {};

  const dashboard = {
    stats: {
      projects: projectsRes.count || 0,
      certificates: certCounts.total,
      internships: certCounts.internships,
      workshops: certCounts.workshops,
      courses: certCounts.courses,
      events: eventsRes.count || 0,
      achievements: achievementsRes.count || 0,
      gallery: galleryRes.count || 0,
      skills: skillsRes.count || 0,
      experience: experienceRes.count || 0,
      visitors: analyticsRes.count || 0,
      unreadMessages,
      totalMessages: messagesRes.count || 0,
      storageUsed,
      githubCommits: counters.github_commits || 0,
      githubRepos: counters.github_repos || 0,
    },
    recentActivity: recentLogsRes.data || [],
  };

  return apiSuccess(dashboard);
});
