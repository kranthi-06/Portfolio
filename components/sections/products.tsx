"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ArrowUpRight, ChevronDown } from "lucide-react";
import { type Product } from "@/lib/content";
import { usePortfolio } from "@/components/portfolio-provider";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";
import { BrowserFrame } from "@/components/ui/browser-frame";

function ProductMockup({ product, active }: { product: Product; active: boolean }) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.98, opacity: active ? 1 : 0.7 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <BrowserFrame
        title={product.name}
        url={product.liveUrl}
        image={product.image}
        accent={product.accent}
        aspectRatio="aspect-[16/10]"
      />
    </motion.div>
  );
}

function CaseStudyPanel({ product }: { product: Product }) {
  const sections = [
    { label: "Problem", content: product.problem },
    { label: "Solution", content: product.solution },
    { label: "Architecture", content: product.architecture },
  ];

  const hasFeatures = product.features && product.features.length > 0;
  const hasRoadmap = product.roadmap && product.roadmap.length > 0;
  const hasChallengesOrLessons = (product.challenges && product.challenges.length > 0) || (product.lessons && product.lessons.length > 0);

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((s) => (
          <div key={s.label} className="p-6 rounded-2xl" style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--ink-muted)" }}>{s.label}</p>
            {s.content ? (
              <div 
                className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none prose-p:mb-3 prose-p:last:mb-0 prose-ul:mb-3 prose-li:mb-1 prose-headings:mb-3 prose-headings:mt-4 prose-headings:first:mt-0" 
                style={{ color: "var(--ink-secondary)" }}
                dangerouslySetInnerHTML={{ __html: s.content }} 
              />
            ) : (
              <p className="text-sm italic opacity-50" style={{ color: "var(--ink-muted)" }}>No {s.label.toLowerCase()} details have been added yet.</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--ink-muted)" }}>Features</p>
          {hasFeatures ? (
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-secondary)" }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--gradient-1)" }} />
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic opacity-50" style={{ color: "var(--ink-muted)" }}>No features added.</p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--ink-muted)" }}>Challenges & lessons</p>
          {product.longDescription ? (
            <div 
              className="text-sm prose prose-sm prose-invert max-w-none prose-p:mb-3 prose-p:last:mb-0 prose-ul:mb-3 prose-li:mb-1 prose-headings:mb-3 prose-headings:mt-4 prose-headings:first:mt-0" 
              style={{ color: "var(--ink-secondary)" }}
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
          ) : hasChallengesOrLessons ? (
            <>
              <ul className="space-y-2 mb-6">
                {product.challenges?.map((c) => (
                  <li key={c} className="text-sm" style={{ color: "var(--ink-secondary)" }}>→ {c}</li>
                ))}
              </ul>
              <ul className="space-y-2">
                {product.lessons?.map((l) => (
                  <li key={l} className="text-sm italic font-serif" style={{ color: "var(--ink-muted)" }}>&ldquo;{l}&rdquo;</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm italic opacity-50" style={{ color: "var(--ink-muted)" }}>No challenges or lessons documented yet.</p>
          )}
        </div>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: "var(--bg-subtle)", border: "1px solid var(--line)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--ink-muted)" }}>Future roadmap</p>
        {hasRoadmap ? (
          <div className="flex flex-wrap gap-3">
            {product.roadmap.map((r, i) => (
              <span key={r} className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--ink-secondary)", border: "1px solid var(--line)" }}>
                {i + 1}. {r}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm italic opacity-50" style={{ color: "var(--ink-muted)" }}>Roadmap is currently open.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={product.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
          Live demo <ExternalLink size={15} />
        </a>
        {product.githubUrl && (
          <a href={product.githubUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
            GitHub <Github size={15} />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function ProductsSection() {
  const { projects } = usePortfolio();
  
  const products: Product[] = projects.map(p => ({
    id: p.id,
    name: p.title,
    tagline: p.subtitle || p.description || "",
    category: p.category || "",
    problem: p.problem || "",
    solution: p.solution || "",
    architecture: p.architecture || "",
    features: p.features || [],
    challenges: p.challenges || [],
    lessons: p.technologies || [],
    roadmap: p.futureScope || [],
    liveUrl: p.liveUrl || "#",
    githubUrl: p.githubUrl || undefined,
    image: p.image || "",
    longDescription: p.longDescription || "",
    accent: "violet"
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const active = products[activeIndex] || products[0];

  if (products.length === 0) return null;

  return (
    <section id="products" className="section" aria-labelledby="products-title">
      <div className="container">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow mb-6">Featured products</p>
          <h2 id="products-title" className="section-title mb-6">
            Not projects.<br />Products.
          </h2>
          <p className="section-subtitle">
            Complete case studies — problem, architecture, lessons, and what comes next.
          </p>
        </Reveal>

        <StaggerReveal className="flex flex-wrap gap-3 mb-12">
          {products.map((p, i) => (
            <StaggerItem key={p.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: i === activeIndex ? "var(--accent)" : "var(--bg-subtle)",
                  color: i === activeIndex ? "var(--accent-fg)" : "var(--ink-muted)",
                  border: `1px solid ${i === activeIndex ? "transparent" : "var(--line)"}`,
                }}
              >
                {p.name}
              </button>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--ink-muted)" }}>
                  {active.category}
                </p>
                <h3 className="font-display text-3xl md:text-4xl font-medium tracking-tight mb-4" style={{ color: "var(--ink)" }}>
                  {active.name}
                </h3>
                <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--ink-secondary)" }}>
                  {active.tagline}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {active.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[11px] px-3 py-1 rounded-full" style={{ background: "var(--accent-soft)", color: "var(--ink-muted)" }}>
                      {f.split(" ")[0]}…
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIndex((activeIndex + 1) % products.length)}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Next product <ArrowUpRight size={14} />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <ProductMockup product={active} active />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 mb-8" style={{ color: "var(--ink-muted)" }}>
          <ChevronDown size={16} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Full case study</span>
        </div>

        <AnimatePresence mode="wait">
          <CaseStudyPanel key={active.id} product={active} />
        </AnimatePresence>
      </div>
    </section>
  );
}
