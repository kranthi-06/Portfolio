export type ContentStatus = "draft" | "published" | "archived";

export type MediaAsset = {
  url: string;
  publicId?: string;
  type: "image" | "pdf" | "video" | "unknown";
};

export type ProfileSettings = {
  name?: string;
  title?: string;
  headline?: string;
  tagline?: string;
  bio?: string;
  about?: string;
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
  avatar_url?: string;
  hero_image_url?: string;
};

export type SocialLinks = Record<string, string | undefined>;
export type CounterSettings = Record<string, number | string | undefined>;

export type Project = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  long_description: string | null;
  problem: string | null;
  solution: string | null;
  features: string[];
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  video_url: string | null;
  media: MediaAsset | null;
  gallery_urls: string[];
  category: string | null;
  architecture: string | null;
  challenges: string[];
  future_scope: string[];
  featured: boolean;
  sort_order: number;
  status: ContentStatus;
};

export type Certificate = {
  id: string;
  title: string;
  organization: string | null;
  description: string | null;
  professional_summary: string | null;
  category: string;
  issue_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  media: MediaAsset;
  thumbnail_url: string | null;
  skills: string[];
  tags: string[];
  sort_order: number;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  company_url: string | null;
  location: string | null;
  type: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  achievements: string[];
  technologies: string[];
  sort_order: number;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  category_label: string | null;
  level: number;
  icon: string | null;
  color: string | null;
  sort_order: number;
};

export type Achievement = {
  id: string;
  title: string;
  event: string | null;
  position: string | null;
  date: string | null;
  description: string | null;
  media: MediaAsset | null;
  color: string | null;
  sort_order: number;
};

export type Event = {
  id: string;
  name: string;
  description: string | null;
  summary: string | null;
  organizer: string | null;
  location: string | null;
  event_date: string | null;
  event_type: string | null;
  achievement: string | null;
  prize: string | null;
  highlights: string[];
  timeline_entry: string | null;
  media: MediaAsset | null;
  sort_order: number;
};

export type GalleryItem = {
  id: string;
  title: string | null;
  caption: string | null;
  media: MediaAsset;
  album: string;
  tags: string[];
  sort_order: number;
};

export type Resume = {
  id: string;
  media: MediaAsset;
  file_name: string;
  file_size: number | null;
  version: number;
  created_at: string;
};

export type SeoSettings = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type GithubStats = {
  username: string;
  data: Record<string, unknown>;
  fetched_at: string;
};

export type PortfolioData = {
  profile: ProfileSettings;
  socialLinks: SocialLinks;
  counters: CounterSettings;
  seo: SeoSettings;
  projects: Project[];
  certificates: Certificate[];
  experience: Experience[];
  skills: Skill[];
  achievements: Achievement[];
  events: Event[];
  gallery: GalleryItem[];
  resume: Resume | null;
  github: GithubStats | null;
  updatedAt: string;
};
