"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Eye, Calendar, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import type { Certificate } from "@/lib/portfolio/types";

const PdfThumbnail = dynamic(
  () => import("./pdf-thumbnail").then((module) => module.PdfThumbnail),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(110deg, var(--bg-subtle) 25%, var(--accent-soft) 45%, var(--bg-subtle) 65%)", backgroundSize: "200% 100%" }} />,
  },
);

export function CertificateCard({ certificate, onView }: { certificate: Certificate; onView: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Try to use a meaningful date
  const displayDate = certificate.issue_date || certificate.completion_date || certificate.end_date || "";

  return (
    <motion.article 
      layout 
      initial={{ opacity: 0, y: 18 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.96 }} 
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} 
      className="group overflow-hidden rounded-[24px] flex flex-col" 
      style={{ 
        background: "var(--bg-elevated)", 
        border: "1px solid var(--line)", 
        boxShadow: "var(--shadow-sm)" 
      }}
    >
      {/* 1. Large Top Image */}
      <button 
        type="button" 
        onClick={onView} 
        className="relative block aspect-[1.42/1] w-full overflow-hidden text-left focus:outline-none shrink-0" 
        aria-label={`View ${certificate.title}`}
      >
        {certificate.media?.type === "pdf" ? (
          <PdfThumbnail src={certificate.media.url} title={certificate.title} />
        ) : imageFailed || !certificate.media?.url ? (
          <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: "var(--bg-subtle)", color: "var(--ink-secondary)" }}>
            <span className="text-center text-xs font-semibold">Unable to load certificate.</span>
          </div>
        ) : (
          <Image 
            src={certificate.media.url} 
            alt={`Preview of ${certificate.title}`} 
            fill 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]" 
            onError={() => setImageFailed(true)} 
          />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2" style={{ background: "rgba(10,10,10,0.72)", color: "white", backdropFilter: "blur(12px)" }}>
          <Eye size={14} /> Quick view
        </span>
        
        {/* 2. Category Badge & 7. Achievement Badge */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm" style={{ background: "var(--bg-body)", color: "var(--ink)", border: "1px solid var(--line)" }}>
            {certificate.category}
          </span>
          
          {certificate.achievement && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm" style={{ background: "linear-gradient(135deg, #FFD700, #FDB931)", color: "#543A00", border: "1px solid rgba(255,255,255,0.4)" }}>
              <Award size={14} /> {certificate.achievement}
            </span>
          )}
        </div>
      </button>
      
      <div className="p-5 flex flex-col flex-grow">
        {/* 3. Title & Issuer */}
        <div className="mb-4">
          <h3 className="line-clamp-2 font-display text-xl font-medium leading-snug tracking-tight mb-2" style={{ color: "var(--ink)" }}>
            {certificate.title}
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold truncate" style={{ color: "var(--ink-secondary)" }}>
              {certificate.organization || "Unknown Issuer"}
            </span>
            {/* 4. Formatted Date */}
            {displayDate && (
              <span className="flex items-center gap-1.5 shrink-0 ml-3 text-xs" style={{ color: "var(--ink-muted)" }}>
                <Calendar size={12} /> {displayDate}
              </span>
            )}
          </div>
        </div>

        {/* 6. Skills Pills */}
        {(certificate.skills?.length > 0 || certificate.technologies?.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[...(certificate.skills || []), ...(certificate.technologies || [])].slice(0, 4).map(skill => (
              <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: "var(--bg-subtle)", color: "var(--ink-secondary)", border: "1px solid var(--line)" }}>
                {skill}
              </span>
            ))}
            {([...(certificate.skills || []), ...(certificate.technologies || [])].length > 4) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ color: "var(--ink-muted)" }}>
                +{([...(certificate.skills || []), ...(certificate.technologies || [])].length - 4)} more
              </span>
            )}
          </div>
        )}
        
        {/* 5. AI Description with Read More */}
        {(certificate.professional_summary || certificate.description) && (
          <div className="mt-auto pt-2 border-t" style={{ borderColor: "var(--line)" }}>
            <AnimatePresence initial={false}>
              <motion.div 
                animate={{ height: expanded ? "auto" : "3rem" }} 
                className="overflow-hidden relative text-sm leading-relaxed"
                style={{ color: "var(--ink-secondary)" }}
              >
                {certificate.professional_summary || certificate.description}
                
                {/* Gradient fade when collapsed */}
                {!expanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--bg-elevated)] to-transparent" />
                )}
              </motion.div>
            </AnimatePresence>
            
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="flex items-center gap-1 text-xs font-bold mt-2 transition-colors hover:opacity-70"
              style={{ color: "var(--gradient-1)" }}
            >
              {expanded ? (
                <><ChevronUp size={14} /> Read less</>
              ) : (
                <><ChevronDown size={14} /> Read more</>
              )}
            </button>
          </div>
        )}
        
        {/* 9. Verification Link */}
        {certificate.verification_url && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--success, #10B981)" }}>
              <CheckCircle2 size={14} /> Verified Credential
            </span>
            <a 
              href={certificate.verification_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-70"
              style={{ color: "var(--ink)" }}
            >
              Verify <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </motion.article>
  );
}
