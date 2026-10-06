"use client";

import { memo, useEffect, useRef, useState, Suspense } from "react";

const thumbnailOptions = { isEvalSupported: false };

function PdfThumbnailInner({ src, title }: { src: string; title: string }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [PdfComponents, setPdfComponents] = useState<{ Document: any; Page: any } | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Dynamically import react-pdf only on client side
  useEffect(() => {
    import("react-pdf").then(({ Document, Page, pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setPdfComponents({ Document, Page });
    }).catch(() => {
      setFailed(true);
    });
  }, []);

  if (!PdfComponents) {
    return (
      <div ref={targetRef} className="certificate-pdf-preview absolute inset-0 overflow-hidden" aria-label={`First page preview of ${title}`}>
        <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(110deg, var(--bg-subtle) 25%, var(--accent-soft) 45%, var(--bg-subtle) 65%)", backgroundSize: "200% 100%" }} />
      </div>
    );
  }

  const { Document, Page } = PdfComponents;

  return (
    <div ref={targetRef} className="certificate-pdf-preview absolute inset-0 overflow-hidden" aria-label={`First page preview of ${title}`}>
      <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(110deg, var(--bg-subtle) 25%, var(--accent-soft) 45%, var(--bg-subtle) 65%)", backgroundSize: "200% 100%" }} />
      {visible && !failed && <Document file={src} options={thumbnailOptions} loading={null} onLoadError={() => setFailed(true)} onSourceError={() => setFailed(true)}><Page pageNumber={1} width={560} renderAnnotationLayer={false} renderTextLayer={false} loading={null} onRenderError={() => setFailed(true)} /></Document>}
      {failed && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs font-semibold" style={{ background: "var(--bg-subtle)", color: "var(--ink-secondary)" }}>Unable to load certificate.</div>}
    </div>
  );
}

export const PdfThumbnail = memo(function PdfThumbnail({ src, title }: { src: string; title: string }) {
  return (
    <Suspense fallback={
      <div className="certificate-pdf-preview absolute inset-0 overflow-hidden" aria-label={`First page preview of ${title}`}>
        <div className="absolute inset-0 animate-pulse" style={{ background: "linear-gradient(110deg, var(--bg-subtle) 25%, var(--accent-soft) 45%, var(--bg-subtle) 65%)", backgroundSize: "200% 100%" }} />
      </div>
    }>
      <PdfThumbnailInner src={src} title={title} />
    </Suspense>
  );
});