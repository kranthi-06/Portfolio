"use client";

import { useState } from "react";
import { Github, RefreshCw, Loader2, ExternalLink, GitCommit, Star, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function GitHubPage() {
  const [username, setUsername] = useState("kranthi-06");
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) throw new Error("User not found");
      const user = await res.json();

      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const repos = reposRes.ok ? await reposRes.json() : [];

      const totalStars = repos.reduce((s: number, r: { stargazers_count: number }) => s + r.stargazers_count, 0);
      const languages = new Map<string, number>();
      repos.forEach((r: { language: string | null }) => {
        if (r.language) languages.set(r.language, (languages.get(r.language) || 0) + 1);
      });

      setStats({
        avatar: user.avatar_url,
        name: user.name,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        totalStars,
        topLanguages: [...languages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
        topRepos: repos.slice(0, 6).map((r: { name: string; description: string; stargazers_count: number; html_url: string; language: string }) => ({
          name: r.name, description: r.description, stars: r.stargazers_count, url: r.html_url, language: r.language,
        })),
      });
      toast.success("GitHub stats loaded");
    } catch (err) { console.error(err); toast.error("Failed to fetch GitHub data"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-2"><Github size={22} /> GitHub Stats</h1>
        <p className="admin-page-subtitle">Fetch and display your GitHub statistics</p>
      </div>

      <div className="flex gap-3 mb-6 max-w-md">
        <input className="admin-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="GitHub username" />
        <button onClick={fetchStats} disabled={loading} className="admin-btn admin-btn-primary">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Fetch
        </button>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Public Repos", value: stats.publicRepos as number, icon: <BookOpen size={16} />, color: "#6366f1" },
              { label: "Total Stars", value: stats.totalStars as number, icon: <Star size={16} />, color: "#f59e0b" },
              { label: "Followers", value: stats.followers as number, icon: <Users size={16} />, color: "#10b981" },
              { label: "Following", value: stats.following as number, icon: <Users size={16} />, color: "#3b82f6" },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: `${s.color}14`, color: s.color }}>{s.icon}</div>
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top Languages */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title">Top Languages</h3></div>
            <div className="admin-card-body">
              <div className="flex flex-wrap gap-2">
                {(stats.topLanguages as [string, number][])?.map(([lang, count]) => (
                  <span key={lang} className="admin-tag">{lang} ({count})</span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Repos */}
          <div className="admin-card">
            <div className="admin-card-header"><h3 className="admin-card-title">Recent Repositories</h3></div>
            <div className="admin-card-body p-0">
              {(stats.topRepos as { name: string; description: string; stars: number; url: string; language: string }[])?.map(r => (
                <div key={r.name} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--admin-line)" }}>
                  <div className="flex-1 min-w-0">
                    <a href={r.url} target="_blank" rel="noopener" className="text-[13px] font-semibold hover:underline" style={{ color: "var(--admin-accent)" }}>{r.name}</a>
                    {r.description && <p className="text-[12px] truncate" style={{ color: "var(--admin-ink-muted)" }}>{r.description}</p>}
                  </div>
                  {r.language && <span className="admin-tag" style={{ fontSize: 10 }}>{r.language}</span>}
                  <span className="text-[12px] flex items-center gap-1" style={{ color: "var(--admin-ink-muted)" }}><Star size={10} />{r.stars}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
