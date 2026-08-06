"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { User, Globe, MousePointer, Download, Github, Linkedin, MessageSquare, ExternalLink, FileText, Activity } from "lucide-react";

interface TimelineEvent {
  id: string;
  event: string;
  data: any;
  time: string;
  location: string;
}

const getEventIcon = (eventName: string) => {
  if (eventName.includes("github")) return <Github size={14} className="text-gray-400" />;
  if (eventName.includes("linkedin")) return <Linkedin size={14} className="text-blue-500" />;
  if (eventName.includes("download")) return <Download size={14} className="text-emerald-500" />;
  if (eventName.includes("contact") || eventName.includes("message")) return <MessageSquare size={14} className="text-indigo-500" />;
  if (eventName.includes("project")) return <MousePointer size={14} className="text-purple-500" />;
  if (eventName.includes("certificate")) return <FileText size={14} className="text-orange-500" />;
  if (eventName.includes("external")) return <ExternalLink size={14} className="text-gray-400" />;
  return <Activity size={14} className="text-blue-400" />;
};

const getEventText = (e: TimelineEvent) => {
  switch (e.event) {
    case "github_click": return "Clicked GitHub link";
    case "linkedin_click": return "Clicked LinkedIn link";
    case "external_link": return `Visited ${e.data?.url || "external link"}`;
    case "resume_download": return "Downloaded Resume";
    case "project_view": return `Viewed project: ${e.data?.label || "Unknown"}`;
    case "certificate_view": return `Viewed certificate: ${e.data?.label || "Unknown"}`;
    case "contact_submit": return "Submitted contact form";
    default: return `Triggered ${e.event}`;
  }
};

export function LiveTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center text-sm" style={{ color: "var(--admin-ink-muted)" }}>
        <Activity size={24} className="mb-2 opacity-50" />
        <p>Waiting for live events...</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
      <AnimatePresence initial={false}>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-[#18181b] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
              {getEventIcon(event.event)}
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] admin-card p-3 shadow-none border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium" style={{ color: "var(--admin-ink)" }}>
                  {getEventText(event)}
                </span>
                <time className="text-[10px]" style={{ color: "var(--admin-ink-muted)" }}>
                  {formatDistanceToNow(new Date(event.time), { addSuffix: true })}
                </time>
              </div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--admin-ink-muted)" }}>
                <Globe size={10} /> {event.location}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
