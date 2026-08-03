"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Eye } from "lucide-react";
import type { CertificateAsset } from "@/lib/generated-certificates";

const PdfThumbnail = dynamic(
  () => import("./pdf-thumbnail").then((module) => module.PdfThumbnail),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(110deg, var(--bg-subtle) 25%, var(--accent-soft) 45%, var(--bg-subtle) 65%)", backgroundSize: "200% 100%" }} />,
  },
);

export function CertificateCard({ certificate, onView }: { certificate: CertificateAsset; onView: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="group overflow-hidden rounded-[22px]" style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
      <button type="button" onClick={onView} className="relative block aspect-[1.42/1] w-full overflow-hidden text-left focus:outline-none" aria-label={`View ${certificate.title}`}>
        {certificate.type === "pdf" ? <PdfThumbnail src={certificate.src} title={certificate.title} /> : imageFailed ? <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: "var(--bg-subtle)", color: "var(--ink-secondary)" }}><span className="text-center text-xs font-semibold">Unable to load certificate.</span></div> : <Image src={certificate.src} alt={`Preview of ${certificate.title}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]" onError={() => setImageFailed(true)} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-0 transition-all duration-300 group-hover:opacity-100" style={{ background: "rgba(10,10,10,0.72)", color: "white", backdropFilter: "blur(12px)" }}><Eye size={12} /> Quick view</span>
      </button>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3"><div className="min-w-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em]" style={{ color: "var(--gradient-1)" }}>{certificate.category}</p><h3 className="line-clamp-2 font-display text-lg font-medium leading-snug tracking-tight" style={{ color: "var(--ink)" }}>{certificate.title}</h3></div><div className="mt-0.5 shrink-0 rounded-xl p-2" style={{ background: "var(--accent-soft)", color: "var(--ink-secondary)" }}><Award size={16} /></div></div>
        <div className="flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--line)" }}><span className="truncate text-xs" style={{ color: "var(--ink-muted)" }}>{certificate.organisation}</span><button type="button" onClick={onView} className="shrink-0 text-xs font-bold transition-opacity hover:opacity-65" style={{ color: "var(--ink)" }}>View <span aria-hidden="true">↗</span></button></div>
      </div>
    </motion.article>
  );
}
