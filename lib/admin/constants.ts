/* Admin-specific constants */

export const CERTIFICATE_CATEGORIES = [
  "Certificate", "Internship", "Workshop", "Webinar", "Course",
  "Hackathon", "Competition", "Bootcamp", "Training", "Achievement",
  "Seminar", "Conference", "Volunteer Work",
] as const;

export type CertificateCategory = typeof CERTIFICATE_CATEGORIES[number];

export const EXPERIENCE_TYPES = [
  "Internship", "Freelancing", "Volunteer Work", "Training", "Full-Time", "Part-Time",
] as const;

export const SKILL_CATEGORIES = [
  "Programming Languages", "Frameworks", "Libraries", "Databases",
  "Tools", "AI Technologies", "Soft Skills", "Cloud", "DevOps", "Other",
] as const;

export const GALLERY_ALBUMS = [
  "General", "Travel", "College", "Hackathon", "Awards",
  "Campus", "Events", "Certificates",
] as const;

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export type ContentStatus = typeof CONTENT_STATUSES[number];

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
export const ALLOWED_PDF_TYPES = ["application/pdf", "application/x-pdf"];
export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

export const STORAGE_BUCKETS = {
  certificates: "certificates",
  events: "events",
  gallery: "gallery",
  projects: "projects",
  resume: "resume",
  documents: "documents",
  avatars: "avatars",
  temporary: "temporary",
} as const;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function isImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

export function isPdfType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

/* ---- Certificate Analysis System Constants ---- */

export const CERTIFICATE_TYPES = [
  "certificate", "award", "participation", "completion",
  "recognition", "license", "diploma", "letter", "badge", "other",
] as const;
export type CertificateType = typeof CERTIFICATE_TYPES[number];

export const EVENT_TYPES = [
  "hackathon", "workshop", "webinar", "competition", "conference",
  "seminar", "bootcamp", "training", "course", "internship",
  "volunteer", "sports", "cultural", "technical", "other",
] as const;
export type EventType = typeof EVENT_TYPES[number];

export const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const IMPORTANCE_LEVELS = ["low", "medium", "high", "critical"] as const;
export type ImportanceLevel = typeof IMPORTANCE_LEVELS[number];

export const CREDIBILITY_LEVELS = ["verified", "unverified", "unknown"] as const;
export type CredibilityLevel = typeof CREDIBILITY_LEVELS[number];

export const SUPPORTING_IMAGE_TYPES = [
  "participation", "winning", "award_ceremony", "stage",
  "presentation", "team", "workshop", "hackathon", "certificate", "general",
] as const;
export type SupportingImageType = typeof SUPPORTING_IMAGE_TYPES[number];

export const ANALYSIS_STATUSES = [
  "pending", "analyzing", "completed", "failed", "fallback",
] as const;
export type AnalysisStatus = typeof ANALYSIS_STATUSES[number];

export const ANALYSIS_STEPS = [
  { key: "upload", label: "Uploading File", icon: "upload" },
  { key: "compress", label: "Compressing Image", icon: "compress" },
  { key: "ocr", label: "Extracting Text", icon: "scan" },
  { key: "ai_analysis", label: "Analyzing Certificate", icon: "sparkles" },
  { key: "validation", label: "Generating Metadata", icon: "check" },
  { key: "complete", label: "Ready for Review", icon: "party" },
] as const;
