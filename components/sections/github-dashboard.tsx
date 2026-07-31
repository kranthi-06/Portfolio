"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Github, Star, GitFork, ExternalLink } from "lucide-react";
import { github as githubData } from "@/lib/content";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/ui/reveal";

function ContributionGraph() {
  const cells = useMemo(() => {
    const weeks = 26;
    const days = 7;
    const result: number[] = [];
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const seed = Math.sin(w * 12.9898 + d * 78.233) * 43758.5453;
        const rand = seed - Math.floor(seed);
        result.push(rand > 0.55 ? Math.ceil(rand * 4) : 0);
      }
    }
    return result;
  }, []);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="inline-grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(26, 11px)`, gridTemplateRows: `repeat(7, 11px)` }}
        aria-label="GitHub contribution activity visualization"
      >
        {cells.map((level, i) => (
          <div key={i} className="contrib-cell" data-level={level} />
        ))}
      </div>
    </div>
  );
}

export function GitHubSection() {
  return (
    <section
      id="github"
      className="section"
      style={{ background: "var(--bg-subtle)" }}
      aria-labelledby="github-title"
    >
      <div className="container">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="eyebrow mb-6">GitHub dashboard</p>
            <h2 id="github-title" className="section-title">
              The workshop<br />is always open.
            </h2>
          </div>
          <a
            href={githubData.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost self-start md:self-auto"
          >
            <Github size={16} /> @{githubData.username}
          </a>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <Reveal>
            <div
              className="p-6 md:p-8 rounded-3xl"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                >
                  <Github size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                    {githubData.username}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    Open source · experiments · works in progress
                  </p>
                </div>
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--ink-muted)" }}>
                Contribution activity
              </p>
              <ContributionGraph />

              <p className="text-[11px] font-bold uppercase tracking-[0.12em] mt-8 mb-4" style={{ color: "var(--ink-muted)" }}>
                Recent activity
              </p>
              <div className="space-y-3">
                {githubData.recentActivity.map((item) => (
                  <div
                    key={item.repo}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid var(--line)" }}
                  >
                    <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
                      <span style={{ color: "var(--ink-muted)" }}>{item.action}</span>{" "}
                      <span className="font-medium" style={{ color: "var(--ink)" }}>{item.repo}</span>
                    </p>
                    <span className="text-xs" style={{ color: "var(--ink-muted)" }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.1}>
              <div
                className="p-6 rounded-3xl"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--ink-muted)" }}>
                  Languages
                </p>
                <div className="h-2 rounded-full overflow-hidden flex mb-4" style={{ background: "var(--bg-subtle)" }}>
                  {githubData.languages.map((lang) => (
                    <motion.div
                      key={lang.name}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${lang.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: lang.color }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {githubData.languages.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2" style={{ color: "var(--ink-secondary)" }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: lang.color }} />
                        {lang.name}
                      </span>
                      <span style={{ color: "var(--ink-muted)" }}>{lang.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <StaggerReveal className="grid md:grid-cols-2 gap-6 mt-6">
          {githubData.pinnedRepos.map((repo) => (
            <StaggerItem key={repo.name}>
              <motion.a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="block p-6 md:p-8 rounded-3xl h-full transition-shadow duration-300 hover:shadow-lg"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Github size={16} style={{ color: "var(--ink-muted)" }} />
                    <span className="font-semibold text-sm" style={{ color: "var(--gradient-1)" }}>
                      {repo.name}
                    </span>
                  </div>
                  <ExternalLink size={14} style={{ color: "var(--ink-muted)" }} />
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink-secondary)" }}>
                  {repo.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-muted)" }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: repo.languageColor }} />
                    {repo.language}
                  </span>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--ink-muted)" }}>
                    <span className="flex items-center gap-1"><Star size={12} /> {repo.stars}</span>
                    <span className="flex items-center gap-1"><GitFork size={12} /> 0</span>
                  </div>
                </div>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
