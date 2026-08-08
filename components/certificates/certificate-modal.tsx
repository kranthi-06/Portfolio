"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, X, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
import type { CertificateAsset } from "@/lib/generated-certificates";

interface CertificateModalProps {
  certificates: CertificateAsset[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function CertificateModal({ certificates, activeIndex, onClose, onChange }: CertificateModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const open = activeIndex !== null;
  const certificate = open ? certificates[activeIndex] : null;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onChange((activeIndex - 1 + certificates.length) % certificates.length);
      if (event.key === "ArrowRight") onChange((activeIndex + 1) % certificates.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [activeIndex, certificates.length, onChange, onClose, open]);

  useEffect(() => { setZoom(1); setImageFailed(false); }, [activeIndex]);

  if (!certificate || activeIndex === null) return null;
  const previous = () => onChange((activeIndex - 1 + certificates.length) % certificates.length);
  const next = () => onChange((activeIndex + 1) % certificates.length);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Certificate viewer: ${certificate.title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button type="button" aria-label="Close certificate viewer" className="absolute inset-0 cursor-default" style={{ background: "rgba(7, 7, 9, 0.62)", backdropFilter: "blur(16px)" }} onClick={onClose} />
          <motion.div className="relative z-10 flex h-[min(850px,92vh)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px]" style={{ background: "var(--bg-elevated)", border: "1px solid var(--glass-border)", boxShadow: "0 32px 100px rgba(0,0,0,.4)" }} initial={{ opacity: 0, scale: 0.97, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 18 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <header className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6" style={{ borderColor: "var(--line)" }}>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--gradient-1)" }}>{certificate.category} · {activeIndex + 1} / {certificates.length}</p><h2 className="truncate font-display text-base font-medium" style={{ color: "var(--ink)" }}>{certificate.title}</h2></div>
              <div className="flex items-center gap-1">
                <><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} className="certificate-icon-button"><ZoomOut size={17} /></button><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))} className="certificate-icon-button"><ZoomIn size={17} /></button></>
                <button ref={closeRef} type="button" aria-label="Close certificate viewer" onClick={onClose} className="certificate-icon-button"><X size={19} /></button>
              </div>
            </header>
            <div className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-6" style={{ background: "var(--bg-subtle)" }}>
              {imageFailed ? (
                <div className="flex h-full min-h-[440px] flex-col items-center justify-center gap-3 text-center" style={{ color: "var(--ink-secondary)" }}><FileText size={32} style={{ color: "var(--gradient-1)" }} /><p className="text-sm font-semibold">Unable to load certificate.</p></div>
              ) : certificate.type === "pdf" ? (
                <div className="flex min-h-full min-w-max items-center justify-center transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
                  <Document file={certificate.src} loading={<div className="animate-pulse w-[800px] h-[600px] bg-zinc-800/20 rounded-xl" />} onLoadError={() => setImageFailed(true)} onSourceError={() => setImageFailed(true)}>
                    <Page pageNumber={1} width={800} renderAnnotationLayer={false} renderTextLayer={false} loading={<div className="animate-pulse w-[800px] h-[600px] bg-zinc-800/20 rounded-xl" />} onRenderError={() => setImageFailed(true)} />
                  </Document>
                </div>
              ) : (
                <div className="flex min-h-full min-w-max items-center justify-center"><Image src={certificate.src} alt={certificate.title} width={1800} height={1300} priority className="h-auto max-h-full w-auto max-w-full rounded-xl transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }} onError={() => setImageFailed(true)} /></div>
              )}
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6" style={{ borderColor: "var(--line)" }}><p className="hidden text-xs sm:block" style={{ color: "var(--ink-muted)" }}>{certificate.organisation}</p><div className="ml-auto flex gap-2"><button type="button" onClick={previous} className="certificate-nav-button" aria-label="Previous certificate"><ChevronLeft size={17} /> Previous</button><button type="button" onClick={next} className="certificate-nav-button" aria-label="Next certificate">Next <ChevronRight size={17} /></button></div></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
