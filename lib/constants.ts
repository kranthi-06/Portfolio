import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Code2,
  Brain,
  Server,
  Wrench,
  Palette,
  Users,
  GraduationCap,
  Trophy,
  Award,
  Star,
} from "lucide-react";

/* ============================================
   Personal Information
   ============================================ */
export const personalInfo = {
  name: "Kasa Kranthi Kiran",
  firstName: "Kasa Kranthi",
  lastName: "Kiran",
  title: "AI Systems Engineer",
  tagline: "Building intelligent products that shape the future",
  roles: [
    "AI Developer",
    "Software Engineer",
    "Problem Solver",
    "Full-Stack Developer",
    "ML Engineer",
  ],
  email: "kasakk2006@gmail.com",
  location: "India",
  availability: "Open to opportunities",
  bio: `I'm a passionate AI Systems Engineer with a deep focus on building intelligent products, generative systems, and computer vision experiences. I transform complex problems into elegant, scalable solutions that make a real impact.`,
  about: `My journey into technology began with a fascination for how machines can learn and adapt. Over the years, I've honed my skills across the full development spectrum — from crafting pixel-perfect frontends to architecting robust backend systems and training sophisticated machine learning models.

I believe in writing clean, maintainable code and building products that not only solve problems but delight users. When I'm not coding, you'll find me exploring the latest in AI research, contributing to open-source projects, or mentoring aspiring developers.

My mission is to bridge the gap between cutting-edge AI research and practical, user-facing applications that create real-world value.`,
  resumeUrl: "/assets/resume.pdf",
};

/* ============================================
   Statistics
   ============================================ */
export const stats = [
  { label: "Years Experience", value: 2, suffix: "+" },
  { label: "Projects Built", value: 15, suffix: "+" },
  { label: "Hackathons", value: 8, suffix: "+" },
  { label: "Technologies", value: 30, suffix: "+" },
];

/* ============================================
   Navigation
   ============================================ */
export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

/* ============================================
   Social Links
   ============================================ */
export const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/kranthi-06",
    icon: Github,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/kranthi-06",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/kranthi06",
    icon: Twitter,
  },
  {
    name: "Email",
    url: "mailto:kasakk2006@gmail.com",
    icon: Mail,
  },
];

/* ============================================
   Skills
   ============================================ */
export interface Skill {
  name: string;
  level: number; // 0-100
  icon?: string;
}

export interface SkillCategory {
  title: string;
  icon: typeof Code2;
  description: string;
  skills: Skill[];
  color: string;
}

export const skillCategories: SkillCategory[] = [
  {
    title: "Programming",
    icon: Code2,
    description: "Core languages I use to build solutions",
    color: "#6C63FF",
    skills: [
      { name: "Python", level: 92 },
      { name: "TypeScript", level: 88 },
      { name: "JavaScript", level: 90 },
      { name: "Java", level: 78 },
      { name: "C++", level: 75 },
      { name: "SQL", level: 82 },
    ],
  },
  {
    title: "Frontend",
    icon: Palette,
    description: "Creating beautiful, responsive interfaces",
    color: "#00D4FF",
    skills: [
      { name: "React", level: 92 },
      { name: "Next.js", level: 88 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Framer Motion", level: 82 },
      { name: "HTML/CSS", level: 95 },
      { name: "Three.js", level: 70 },
    ],
  },
  {
    title: "Backend",
    icon: Server,
    description: "Building scalable server architectures",
    color: "#A855F7",
    skills: [
      { name: "Node.js", level: 88 },
      { name: "Express.js", level: 85 },
      { name: "FastAPI", level: 82 },
      { name: "Django", level: 78 },
      { name: "MongoDB", level: 85 },
      { name: "PostgreSQL", level: 80 },
    ],
  },
  {
    title: "AI / ML",
    icon: Brain,
    description: "Intelligent systems and models",
    color: "#F472B6",
    skills: [
      { name: "TensorFlow", level: 85 },
      { name: "PyTorch", level: 82 },
      { name: "OpenCV", level: 88 },
      { name: "LangChain", level: 80 },
      { name: "Scikit-learn", level: 85 },
      { name: "Hugging Face", level: 78 },
    ],
  },
  {
    title: "Tools",
    icon: Wrench,
    description: "DevOps and development tools",
    color: "#FBBF24",
    skills: [
      { name: "Git", level: 90 },
      { name: "Docker", level: 80 },
      { name: "AWS", level: 75 },
      { name: "Vercel", level: 88 },
      { name: "Figma", level: 78 },
      { name: "Linux", level: 82 },
    ],
  },
  {
    title: "Soft Skills",
    icon: Users,
    description: "Collaboration and leadership",
    color: "#34D399",
    skills: [
      { name: "Team Leadership", level: 88 },
      { name: "Problem Solving", level: 92 },
      { name: "Communication", level: 85 },
      { name: "Agile/Scrum", level: 82 },
      { name: "Mentoring", level: 80 },
      { name: "Public Speaking", level: 75 },
    ],
  },
];

/* ============================================
   Experience
   ============================================ */
export interface Experience {
  title: string;
  company: string;
  companyUrl?: string;
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export const experiences: Experience[] = [
  {
    title: "AI Engineer Intern",
    company: "Tech Startup",
    location: "Remote",
    type: "Internship",
    startDate: "Jun 2025",
    endDate: "Present",
    description:
      "Building intelligent AI products and generative systems. Working on computer vision pipelines and LLM-based applications to solve real-world problems.",
    achievements: [
      "Developed a computer vision pipeline that improved object detection accuracy by 25%",
      "Built an LLM-powered chatbot reducing customer support tickets by 40%",
      "Implemented RAG-based document retrieval system for internal knowledge base",
      "Optimized model inference latency by 60% through quantization and batching",
    ],
    technologies: [
      "Python",
      "PyTorch",
      "LangChain",
      "FastAPI",
      "OpenCV",
      "Docker",
      "AWS",
    ],
  },
  {
    title: "Full-Stack Developer Intern",
    company: "Digital Agency",
    location: "Hybrid",
    type: "Internship",
    startDate: "Jan 2025",
    endDate: "May 2025",
    description:
      "Developed modern web applications using React and Node.js. Collaborated with cross-functional teams to deliver scalable solutions for clients.",
    achievements: [
      "Built a real-time collaboration platform serving 1000+ concurrent users",
      "Reduced page load times by 45% through code splitting and lazy loading",
      "Implemented CI/CD pipelines that cut deployment time from 2 hours to 15 minutes",
      "Mentored 3 junior developers in React best practices",
    ],
    technologies: [
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "Tailwind CSS",
      "TypeScript",
    ],
  },
];

/* ============================================
   Projects
   ============================================ */
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  problem: string;
  solution: string;
  features: string[];
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
  category: string;
  featured: boolean;
  architecture?: string;
  challenges?: string[];
  futureScope?: string[];
}

export const projects: Project[] = [
  {
    id: "lakshyatrack",
    title: "LakshyaTrack",
    subtitle: "AI-Powered Goal Tracking Platform",
    description:
      "An intelligent goal management platform that uses AI to help users track, analyze, and achieve their personal and professional goals with data-driven insights.",
    longDescription:
      "LakshyaTrack is a comprehensive goal tracking platform that combines traditional productivity tools with cutting-edge AI capabilities. The platform uses machine learning to analyze user behavior patterns, predict goal completion likelihood, and provide personalized recommendations for staying on track.",
    problem:
      "Traditional goal-tracking apps lack intelligent insights and fail to adapt to individual user behavior, leading to high abandonment rates and unfulfilled objectives.",
    solution:
      "Built an AI-powered platform that learns from user patterns, provides predictive analytics, sends smart reminders, and offers personalized strategies for goal achievement.",
    features: [
      "AI-powered goal analysis and recommendations",
      "Predictive completion tracking with ML models",
      "Interactive dashboards with real-time analytics",
      "Smart notification system based on user behavior",
      "Collaborative goal setting for teams",
      "Progress visualization with animated charts",
    ],
    technologies: [
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "Python",
      "TensorFlow",
      "Tailwind CSS",
      "Chart.js",
    ],
    githubUrl: "https://github.com/kranthi-06/lakshyatrack",
    liveUrl: "https://lakshyatrack.vercel.app/",
    image: "/assets/projects/lakshyatrack.png",
    category: "Full-Stack AI",
    featured: true,
    architecture:
      "Microservices architecture with React frontend, Node.js API gateway, Python ML service, and MongoDB for data persistence. Redis for caching and real-time features.",
    challenges: [
      "Designing an ML model that generalizes across diverse goal types",
      "Handling real-time data synchronization across devices",
      "Building an intuitive UI for complex analytics data",
    ],
    futureScope: [
      "Integration with wearable devices for health goals",
      "Advanced NLP for voice-based goal input",
      "Social features for community accountability",
    ],
  },
  {
    id: "srec-community",
    title: "SREC Community",
    subtitle: "Smart Campus & Sentiment Intelligence Platform",
    description:
      "A comprehensive campus management platform that streamlines communication, events, sentiment feedback, and resources for students, faculty, and administrators.",
    longDescription:
      "SREC Community is a full-featured campus intelligence system designed to bridge the communication gap between students, faculty, and administration. It provides real-time event management, resource booking, feedback tracking, and AI-powered sentiment analytics.",
    problem:
      "University campuses struggle with fragmented communication channels, manual event management, and lack of centralized resource allocation — leading to confusion and inefficiency.",
    solution:
      "Created a unified platform with real-time notifications, smart scheduling, AI-powered assistance, and comprehensive dashboards for all campus stakeholders.",
    features: [
      "Real-time campus event management and discovery",
      "AI-powered campus sentiment analysis and feedback",
      "Smart resource and room booking system",
      "Complaint management with auto-routing",
      "Faculty-student communication portal",
      "Analytics dashboard for administrators",
    ],
    technologies: [
      "React",
      "Express.js",
      "MongoDB",
      "Socket.io",
      "Python",
      "OpenAI API",
      "Firebase",
      "Tailwind CSS",
    ],
    githubUrl: "https://github.com/kranthi-06/srec-community",
    liveUrl: "https://srec-community.vercel.app/",
    image: "/assets/projects/srec-community.png",
    category: "Community Platform",
    featured: true,
    architecture:
      "MERN stack with Socket.io for real-time features, Firebase for authentication and push notifications, and Python microservice for AI sentiment analysis.",
    challenges: [
      "Building real-time features that scale to thousands of concurrent users",
      "Implementing role-based access control across multiple user types",
      "Designing an intuitive mobile-first experience for diverse user groups",
    ],
    futureScope: [
      "Mobile app with Flutter",
      "AR-based campus navigation",
      "Integration with university ERP systems",
    ],
  },
];

/* ============================================
   Achievements
   ============================================ */
export interface Achievement {
  title: string;
  event: string;
  position: string;
  date: string;
  description: string;
  icon: typeof Trophy;
  color: string;
}

export const achievements: Achievement[] = [
  {
    title: "1st Place Winner",
    event: "National AI Hackathon 2025",
    position: "🥇 Winner",
    date: "March 2025",
    description:
      "Won first place among 500+ teams for building an AI-powered accessibility tool for visually impaired users.",
    icon: Trophy,
    color: "#FFD700",
  },
  {
    title: "Best Innovation Award",
    event: "Smart India Hackathon 2024",
    position: "🏆 Best Innovation",
    date: "December 2024",
    description:
      "Received the Best Innovation Award for developing a real-time traffic optimization system using computer vision.",
    icon: Award,
    color: "#6C63FF",
  },
  {
    title: "Top 10 Finalist",
    event: "Google Solution Challenge 2024",
    position: "🌟 Top 10",
    date: "April 2024",
    description:
      "Selected as a Top 10 finalist globally for a sustainability-focused project addressing UN SDGs.",
    icon: Star,
    color: "#00D4FF",
  },
  {
    title: "2nd Place Winner",
    event: "University Code Sprint",
    position: "🥈 Runner Up",
    date: "February 2024",
    description:
      "Secured second position in a 24-hour coding competition focused on building scalable web applications.",
    icon: Trophy,
    color: "#C0C0C0",
  },
];

/* ============================================
   Certifications
   ============================================ */
export interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  image?: string;
}

export const certifications: Certification[] = [
  {
    title: "Deep Learning Specialization",
    issuer: "Coursera (Andrew Ng)",
    date: "2024",
    credentialUrl: "#",
  },
  {
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2024",
    credentialUrl: "#",
  },
  {
    title: "TensorFlow Developer Certificate",
    issuer: "Google",
    date: "2024",
    credentialUrl: "#",
  },
  {
    title: "Full-Stack Web Development",
    issuer: "Meta (Coursera)",
    date: "2023",
    credentialUrl: "#",
  },
  {
    title: "Machine Learning with Python",
    issuer: "IBM (Coursera)",
    date: "2023",
    credentialUrl: "#",
  },
];

/* ============================================
   Education
   ============================================ */
export interface Education {
  degree: string;
  branch: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  cgpa: string;
  coursework: string[];
  icon: typeof GraduationCap;
}

export const education: Education[] = [
  {
    degree: "Bachelor of Technology",
    branch: "Computer Science & Engineering",
    institution: "University Name",
    location: "India",
    startYear: "2022",
    endYear: "2026",
    cgpa: "8.5 / 10",
    coursework: [
      "Data Structures & Algorithms",
      "Machine Learning",
      "Artificial Intelligence",
      "Computer Vision",
      "Database Management",
      "Operating Systems",
      "Computer Networks",
      "Software Engineering",
    ],
    icon: GraduationCap,
  },
];

/* ============================================
   Tech Marquee Items
   ============================================ */
export const techMarqueeItems = [
  "React", "Next.js", "TypeScript", "Python", "TensorFlow",
  "PyTorch", "Node.js", "MongoDB", "PostgreSQL", "Docker",
  "AWS", "Tailwind CSS", "Three.js", "OpenCV", "LangChain",
  "FastAPI", "Redis", "Git", "Figma", "Vercel",
];

/* ============================================
   Command Palette Actions
   ============================================ */
export const commandPaletteActions = [
  { label: "Go to Home", section: "home", shortcut: "G H" },
  { label: "Go to About", section: "about", shortcut: "G A" },
  { label: "Go to Skills", section: "skills", shortcut: "G S" },
  { label: "Go to Experience", section: "experience", shortcut: "G E" },
  { label: "Go to Projects", section: "projects", shortcut: "G P" },
  { label: "Go to Contact", section: "contact", shortcut: "G C" },
  { label: "Download Resume", section: "resume", shortcut: "D R" },
  { label: "View GitHub", section: "github", shortcut: "V G" },
];
