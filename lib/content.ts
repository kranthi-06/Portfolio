/* ============================================
   Portfolio Content — single source of truth
   Derived from resume data; copy rewritten naturally.
   ============================================ */

export type ThemeId = "pearl" | "midnight" | "aurora";

export const personal = {
  name: "Kasa Kranthi Kiran",
  shortName: "Kranthi",
  initials: "KKK",
  title: "AI Systems Engineer",
  headline: "Building intelligence people actually want to use.",
  subheadline:
    "I design and ship AI-native products — from model pipelines to the interface someone touches every morning.",
  location: "India",
  availability: "Open to opportunities",
  email: "kasakk2006@gmail.com",
  portrait: "/assets/images/kranthi-kiran-portrait.png",
  resumeUrl: "/assets/resume.pdf",
};

export const links = {
  email: `mailto:${personal.email}`,
  github: "https://github.com/kranthi-06",
  linkedin: "https://www.linkedin.com/in/kasakranthikiran06/",
  lakshyaTrack: "https://lakshyatrack.vercel.app/",
  srecCommunity: "https://srec-community.vercel.app/",
};

export const nav = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Journey", href: "#journey" },
  { label: "Products", href: "#products" },
  { label: "Playground", href: "#playground" },
  { label: "Achievements", href: "#achievements" },
  { label: "GitHub", href: "#github" },
  { label: "Next", href: "#next" },
  { label: "Collaborate", href: "#collaborate" },
] as const;

export const philosophy = {
  eyebrow: "My philosophy",
  title: "Why I build.",
  pillars: [
    {
      id: "why-ai",
      label: "Why AI",
      body: "Intelligence belongs in the product — not as a demo, but as a quiet layer that makes decisions clearer and work lighter. I'm drawn to systems that learn, adapt, and stay useful over time.",
    },
    {
      id: "why-products",
      label: "Why products",
      body: "Research without a surface never changes anyone's day. I care about the full arc: problem, architecture, interface, and the moment a user trusts what you built.",
    },
    {
      id: "how-i-think",
      label: "How I think",
      body: "Start with the constraint. Prototype before you polish. Treat every interaction as part of the system. Refine until complex technology feels calm and legible.",
    },
    {
      id: "vision",
      label: "Vision",
      body: "Bridge cutting-edge AI with practical, human-facing applications. Build tools that earn a place in someone's workflow — not technology for its own sake.",
    },
  ],
  closing:
    "The interesting work begins when a difficult problem becomes legible — when intelligence feels obvious, not impressive.",
};

export const journey = [
  {
    year: "2023",
    phase: "Foundation",
    title: "B.Tech — Computer Science & Engineering (AI & ML)",
    org: "Engineering College, India",
    detail:
      "Started formal training in algorithms, systems, and software engineering. Coursework in ML, AI, computer vision, and databases.",
    tags: ["DSA", "ML", "AI", "Computer Vision"],
  },
  {
    year: "2023",
    phase: "Learning",
    title: "Deepening the stack",
    org: "Self-directed + coursework",
    detail:
      "Expanded into full-stack web development, Python for ML, and modern frontend tooling. Built foundations across React, Node.js, and cloud deployment.",
    tags: ["React", "Python", "Next.js", "TensorFlow"],
  },
  {
    year: "2024",
    phase: "Building",
    title: "Hackathons & competitions",
    org: "National & university events",
    detail:
      "Competed in hackathons including Smart India Hackathon and Google Solution Challenge. Focused on AI accessibility, computer vision, and sustainability.",
    tags: ["Hackathons", "Computer Vision", "Innovation"],
  },
  {
    year: "2025",
    phase: "Internships",
    title: "Software Engineer Intern",
    org: "YugaYatra · Remote",
    detail:
      "Building intelligent products — computer vision pipelines, LLM applications, and RAG-based systems for real-world problems.",
    tags: ["PyTorch", "LangChain", "FastAPI", "OpenCV"],
  },
  {
    year: "2025",
    phase: "Internships",
    title: "Generative AI Intern",
    org: "Codetantra · Offline",
    detail:
      "Shipped modern web applications with React and Node.js. Improved performance, CI/CD, and collaborated across design and engineering.",
    tags: ["React", "Node.js", "MongoDB", "TypeScript"],
  },
  {
    year: "Now",
    phase: "Products",
    title: "Shipping live products",
    org: "Independent",
    detail:
      "LakshyaTrack and SREC Community are live and in use. Currently exploring generative systems, product UX for AI, and the next generation of intelligent tools.",
    tags: ["Live products", "AI UX", "Full-stack"],
  },
  {
    year: "Future",
    phase: "Horizon",
    title: "What's ahead",
    org: "The next chapter",
    detail:
      "Founder-minded work at the intersection of AI and product — building systems that scale, interfaces that delight, and teams that move fast.",
    tags: ["AI startups", "Product leadership", "Open source"],
  },
];

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: string;
  liveUrl: string;
  image: string;
  githubUrl?: string;
  problem: string;
  solution: string;
  architecture: string;
  features: string[];
  challenges: string[];
  lessons: string[];
  roadmap: string[];
  metrics?: { label: string; value: string }[];
  accent: "violet" | "ocean" | "ember";
}

export const products: Product[] = [
  {
    id: "lakshyatrack",
    name: "LakshyaTrack",
    tagline: "AI-powered goal tracking that adapts to how you actually work.",
    category: "Full-Stack AI Product",
    liveUrl: links.lakshyaTrack,
    image: "/assets/projects/lakshyatrack.png",
    githubUrl: "https://github.com/kranthi-06/lakshyatrack",
    problem:
      "Most goal apps treat every user the same. They track tasks but never learn — leading to abandoned goals and dashboards nobody opens.",
    solution:
      "An intelligent platform that analyzes behavior patterns, predicts completion likelihood, and delivers personalized strategies to keep goals on track.",
    architecture:
      "React + Next.js frontend, Node.js API gateway, Python ML service for predictions, MongoDB for persistence, Redis for real-time features.",
    features: [
      "AI-driven goal analysis and recommendations",
      "Predictive completion tracking",
      "Real-time analytics dashboards",
      "Smart notifications based on behavior",
      "Collaborative goal setting for teams",
      "Animated progress visualization",
    ],
    challenges: [
      "Generalizing ML models across diverse goal types",
      "Real-time sync across devices",
      "Making complex analytics feel intuitive",
    ],
    lessons: [
      "AI features must feel invisible — value first, technology second",
      "Dashboard density kills engagement; progressive disclosure wins",
      "Ship the core loop before the intelligence layer",
    ],
    roadmap: [
      "Wearable integration for health goals",
      "Voice-based goal input with NLP",
      "Community accountability features",
    ],
    accent: "violet",
  },
  {
    id: "srec-community",
    name: "SREC Community",
    tagline: "A connected campus experience for students, faculty, and admins.",
    category: "Community Platform",
    liveUrl: links.srecCommunity,
    image: "/assets/projects/srec-community.png",
    githubUrl: "https://github.com/kranthi-06/srec-community",
    problem:
      "Campus life is fragmented — events, resources, and communication scattered across channels nobody checks.",
    solution:
      "A unified web platform for the SREC ecosystem: events, resources, and community — designed to feel alive, not administrative.",
    architecture:
      "Modern React frontend, Node.js backend, real-time updates, role-based access for students, faculty, and administrators.",
    features: [
      "Campus event discovery and management",
      "Resource and communication hub",
      "Role-based dashboards",
      "Mobile-first responsive design",
      "Real-time notifications",
      "Community-focused UX",
    ],
    challenges: [
      "Designing for multiple user types with different needs",
      "Balancing feature depth with simplicity",
      "Performance on varied network conditions",
    ],
    lessons: [
      "Community products live or die by notification quality",
      "Every role needs a distinct home screen, not a filtered view",
      "Launch with one killer loop, then expand",
    ],
    roadmap: [
      "Native mobile companion app",
      "Deeper integration with campus systems",
      "AI-powered campus assistant",
    ],
    accent: "ocean",
  },
];

export const playground = {
  eyebrow: "Engineering playground",
  title: "Where the craft lives.",
  subtitle:
    "No progress bars. No badges. Just the tools I reach for when building intelligent products.",
  domains: [
    {
      id: "programming",
      label: "Programming",
      icon: "code",
      tools: ["Python", "TypeScript", "JavaScript", "Java", "C++", "SQL"],
      color: "#6366f1",
    },
    {
      id: "ai",
      label: "AI / ML",
      icon: "brain",
      tools: ["PyTorch", "TensorFlow", "OpenCV", "LangChain", "Scikit-learn", "Hugging Face"],
      color: "#ec4899",
    },
    {
      id: "frontend",
      label: "Frontend",
      icon: "palette",
      tools: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "HTML/CSS"],
      color: "#06b6d4",
    },
    {
      id: "backend",
      label: "Backend",
      icon: "server",
      tools: ["Node.js", "Express.js", "FastAPI", "Django", "MongoDB", "PostgreSQL", "Supabase"],
      color: "#a855f7",
    },
    {
      id: "devtools",
      label: "Developer Tools",
      icon: "wrench",
      tools: ["Git", "Docker", "Linux", "Figma", "Vercel"],
      color: "#f59e0b",
    },
    {
      id: "cloud",
      label: "Cloud",
      icon: "cloud",
      tools: ["AWS", "Vercel", "Firebase", "Atlas"],
      color: "#10b981",
    },
  ],
  marquee: [
    "React", "Next.js", "TypeScript", "Python", "TensorFlow", "PyTorch",
    "Node.js", "MongoDB", "PostgreSQL", "Docker", "AWS", "Tailwind CSS",
    "OpenCV", "LangChain", "FastAPI", "Redis", "Git", "Figma", "Vercel",
    "Framer Motion", "Supabase", "Linux", "Scikit-learn", "Hugging Face",
    "HTML/CSS", "Express.js", "Django", "Firebase", "Atlas",
  ],
};

export const achievements = {
  eyebrow: "Achievements",
  title: "Milestones along the way.",
  stats: [
    { label: "Years building", value: 2, suffix: "+" },
    { label: "Projects shipped", value: 15, suffix: "+" },
    { label: "Hackathons", value: 8, suffix: "+" },
    { label: "Technologies", value: 30, suffix: "+" },
  ],
  awards: [
    {
      title: "1st Place",
      event: "National AI Hackathon 2025",
      date: "March 2025",
      detail: "AI-powered accessibility tool for visually impaired users among 500+ teams.",
      accent: "#FFD700",
    },
    {
      title: "Best Innovation",
      event: "Smart India Hackathon 2024",
      date: "December 2024",
      detail: "Real-time traffic optimization using computer vision.",
      accent: "#6366f1",
    },
    {
      title: "Top 10 Finalist",
      event: "Google Solution Challenge 2024",
      date: "April 2024",
      detail: "Sustainability project addressing UN SDGs — selected globally.",
      accent: "#06b6d4",
    },
    {
      title: "2nd Place",
      event: "University Code Sprint",
      date: "February 2024",
      detail: "24-hour competition building scalable web applications.",
      accent: "#C0C0C0",
    },
  ],
  certifications: [
    { title: "Deep Learning Specialization", issuer: "Coursera (Andrew Ng)", year: "2024" },
    { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", year: "2024" },
    { title: "TensorFlow Developer Certificate", issuer: "Google", year: "2024" },
    { title: "Full-Stack Web Development", issuer: "Meta (Coursera)", year: "2023" },
    { title: "Machine Learning with Python", issuer: "IBM (Coursera)", year: "2023" },
  ],
};

export const github = {
  username: "kranthi-06",
  profileUrl: links.github,
  pinnedRepos: [
    {
      name: "lakshyatrack",
      description: "AI-powered goal tracking platform with predictive analytics.",
      language: "TypeScript",
      languageColor: "#3178c6",
      stars: 0,
      url: "https://github.com/kranthi-06/lakshyatrack",
    },
    {
      name: "campuspulse",
      description: "Smart campus management system with real-time features.",
      language: "JavaScript",
      languageColor: "#f1e05a",
      stars: 0,
      url: "https://github.com/kranthi-06/campuspulse",
    },
  ],
  languages: [
    { name: "TypeScript", percent: 35, color: "#3178c6" },
    { name: "Python", percent: 30, color: "#3572A5" },
    { name: "JavaScript", percent: 20, color: "#f1e05a" },
    { name: "Other", percent: 15, color: "#8b949e" },
  ],
  recentActivity: [
    { action: "Pushed to", repo: "lakshyatrack", time: "Recently" },
    { action: "Updated", repo: "portfolio-me", time: "Recently" },
    { action: "Created", repo: "srec-community", time: "Recently" },
  ],
};

export const whatsNext = {
  eyebrow: "What's next",
  title: "The work ahead.",
  current: [
    {
      label: "In progress",
      title: "Generative AI product experiments",
      detail: "Exploring LLM-native interfaces and RAG architectures for knowledge-heavy workflows.",
    },
    {
      label: "In progress",
      title: "LakshyaTrack intelligence layer",
      detail: "Deepening predictive models and refining the core goal-tracking experience.",
    },
  ],
  ideas: [
    "AI-native developer tools with contextual assistance",
    "Computer vision systems for accessibility",
    "Open-source ML utilities for product teams",
  ],
  roadmap: [
    { quarter: "Q1 2026", item: "Expand LakshyaTrack ML pipeline and mobile experience" },
    { quarter: "Q2 2026", item: "Launch open-source AI tooling project" },
    { quarter: "Q3 2026", item: "Explore founder opportunities in AI product space" },
  ],
};

export const collaborate = {
  eyebrow: "Let's build together",
  title: "Have something worth building?",
  subtitle:
    "Whether you're shaping an AI product, solving a hard technical problem, or looking for someone who thinks in systems and ships in code — I'd like to hear from you.",
  channels: [
    { label: "Email", value: personal.email, href: links.email, icon: "mail" },
    { label: "LinkedIn", value: "Connect professionally", href: links.linkedin, icon: "linkedin" },
    { label: "GitHub", value: "@kranthi-06", href: links.github, icon: "github" },
  ],
};

export const footer = {
  tagline: "Designed and built by Kasa Kranthi Kiran",
  year: new Date().getFullYear(),
};
