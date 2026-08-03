"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Search, Sparkles } from "lucide-react";
import { certificateAssets, type CertificateAsset } from "@/lib/generated-certificates";
import { getCertificateCategories } from "@/lib/certificate-utils";
import { CategoryFilter } from "@/components/certificates/category-filter";
import { CertificateGrid } from "@/components/certificates/certificate-grid";
import { CertificateModal } from "@/components/certificates/certificate-modal";

export function CertificationsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateAsset | null>(null);
  const categories = useMemo(() => getCertificateCategories(certificateAssets), []);
  const counts = useMemo(() => Object.fromEntries(["All", ...categories].map((category) => [category, category === "All" ? certificateAssets.length : certificateAssets.filter((certificate) => certificate.category === category).length])), [categories]);
  const visibleCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return certificateAssets.filter((certificate) => {
      const matchesCategory = activeCategory === "All" || certificate.category === activeCategory;
      const matchesSearch = !query || [certificate.title, certificate.organisation, certificate.category].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);
  const selectedIndex = selectedCertificate ? visibleCertificates.findIndex((certificate) => certificate.id === selectedCertificate.id) : null;

  return (
    <section id="certifications" className="section overflow-hidden" aria-labelledby="certifications-title">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="mb-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div className="max-w-2xl">
            <p className="eyebrow mb-6">Learning archive</p>
            <h2 id="certifications-title" className="section-title mb-6">Credentials that <span className="font-serif italic font-normal">compound.</span></h2>
            <p className="section-subtitle">A curated record of hands-on learning, industry programs, and milestones across AI, software engineering, and product development.</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl" style={{ background: "var(--line)", border: "1px solid var(--line)" }}>
            <div className="min-w-[125px] px-5 py-4" style={{ background: "var(--bg-elevated)" }}><Award size={16} className="mb-2" style={{ color: "var(--gradient-1)" }} /><p className="font-display text-2xl font-medium tracking-tight" style={{ color: "var(--ink)" }}>{certificateAssets.length}</p><p className="text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: "var(--ink-muted)" }}>Records</p></div>
            <div className="min-w-[125px] px-5 py-4" style={{ background: "var(--bg-elevated)" }}><Sparkles size={16} className="mb-2" style={{ color: "var(--gradient-2)" }} /><p className="font-display text-2xl font-medium tracking-tight" style={{ color: "var(--ink)" }}>{categories.length}</p><p className="text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: "var(--ink-muted)" }}>Areas</p></div>
          </div>
        </motion.div>

        <div className="mb-8 flex flex-col gap-5 border-y py-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--line)" }}>
          <CategoryFilter categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} counts={counts} />
          <label className="relative block w-full lg:w-64"><span className="sr-only">Search certificates</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-muted)" }} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search credentials" className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2" style={{ background: "var(--bg-subtle)", color: "var(--ink)", border: "1px solid var(--line)", ['--tw-ring-color' as string]: "var(--line-strong)" }} /></label>
        </div>

        <CertificateGrid certificates={visibleCertificates} onView={setSelectedCertificate} />
      </div>
      <CertificateModal certificates={visibleCertificates} activeIndex={selectedIndex !== null && selectedIndex >= 0 ? selectedIndex : null} onClose={() => setSelectedCertificate(null)} onChange={(index) => setSelectedCertificate(visibleCertificates[index] ?? null)} />
    </section>
  );
}
