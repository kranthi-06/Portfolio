"use client";

import { AnimatePresence } from "framer-motion";
import type { CertificateAsset } from "@/lib/generated-certificates";
import { CertificateCard } from "./certificate-card";

export function CertificateGrid({ certificates, onView }: { certificates: CertificateAsset[]; onView: (certificate: CertificateAsset) => void }) {
  if (!certificates.length) {
    return <div className="rounded-3xl px-6 py-16 text-center" style={{ background: "var(--bg-subtle)", border: "1px dashed var(--line-strong)", color: "var(--ink-secondary)" }}>No credentials match that search.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {certificates.map((certificate) => <CertificateCard key={certificate.id} certificate={certificate} onView={() => onView(certificate)} />)}
      </AnimatePresence>
    </div>
  );
}
