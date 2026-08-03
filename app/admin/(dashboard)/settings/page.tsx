"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Globe, User, Hash, Palette, Search } from "lucide-react";
import { toast } from "sonner";

type TabId = "profile" | "social" | "seo" | "counters" | "theme";
const tabs: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "social", label: "Social Links", icon: Globe },
  { id: "seo", label: "SEO", icon: Search },
  { id: "counters", label: "Counters", icon: Hash },
  { id: "theme", label: "Theme", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchSettings() {
    try { const res = await fetch("/api/admin/settings"); if (res.ok) { const { data } = await res.json(); setSettings(data || {}); } }
    catch { toast.error("Failed to load settings"); } finally { setLoading(false); }
  }

  useEffect(() => { fetchSettings(); }, []);

  function updateSetting(key: string, field: string, value: unknown) {
    setSettings(prev => ({
      ...prev,
      [key]: { ...(prev[key] as Record<string, unknown> || {}), [field]: value },
    }));
  }

  async function save(key: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: settings[key] }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved!");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  const profile = (settings.profile || {}) as Record<string, string>;
  const social = (settings.social_links || {}) as Record<string, string>;
  const seo = (settings.seo || {}) as Record<string, string>;
  const counters = (settings.counters || {}) as Record<string, number>;
  const theme = (settings.theme || {}) as Record<string, unknown>;

  return (
    <div>
      <div className="admin-page-header"><h1 className="admin-page-title">Settings</h1><p className="admin-page-subtitle">Manage your portfolio configuration</p></div>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`admin-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            <t.icon size={12} className="inline mr-1" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-card p-6 space-y-4">{[1,2,3,4].map(i => <div key={i} className="admin-skeleton h-10 rounded-xl" />)}</div>
      ) : (
        <div className="admin-card">
          <div className="admin-card-body space-y-4">
            {activeTab === "profile" && (<>
              <div className="admin-field"><label className="admin-label">Full Name</label><input className="admin-input" value={profile.name || ""} onChange={e => updateSetting("profile", "name", e.target.value)} /></div>
              <div className="admin-field"><label className="admin-label">Title</label><input className="admin-input" value={profile.title || ""} onChange={e => updateSetting("profile", "title", e.target.value)} /></div>
              <div className="admin-field"><label className="admin-label">Bio</label><textarea className="admin-input admin-textarea" value={profile.bio || ""} onChange={e => updateSetting("profile", "bio", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="admin-field"><label className="admin-label">Email</label><input className="admin-input" value={profile.email || ""} onChange={e => updateSetting("profile", "email", e.target.value)} /></div>
                <div className="admin-field"><label className="admin-label">Phone</label><input className="admin-input" value={profile.phone || ""} onChange={e => updateSetting("profile", "phone", e.target.value)} /></div>
              </div>
              <div className="admin-field"><label className="admin-label">Location</label><input className="admin-input" value={profile.location || ""} onChange={e => updateSetting("profile", "location", e.target.value)} /></div>
              <button onClick={() => save("profile")} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Profile</button>
            </>)}

            {activeTab === "social" && (<>
              <div className="admin-field"><label className="admin-label">GitHub</label><input className="admin-input" value={social.github || ""} onChange={e => updateSetting("social_links", "github", e.target.value)} /></div>
              <div className="admin-field"><label className="admin-label">LinkedIn</label><input className="admin-input" value={social.linkedin || ""} onChange={e => updateSetting("social_links", "linkedin", e.target.value)} /></div>
              <div className="admin-field"><label className="admin-label">Twitter</label><input className="admin-input" value={social.twitter || ""} onChange={e => updateSetting("social_links", "twitter", e.target.value)} /></div>
              <div className="admin-field"><label className="admin-label">Website</label><input className="admin-input" value={social.website || ""} onChange={e => updateSetting("social_links", "website", e.target.value)} /></div>
              <button onClick={() => save("social_links")} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Links</button>
            </>)}

            {activeTab === "seo" && (<>
              <div className="admin-field"><label className="admin-label">SEO Title</label><input className="admin-input" value={seo.title || ""} onChange={e => updateSetting("seo", "title", e.target.value)} /></div>
              <div className="admin-field"><label className="admin-label">SEO Description</label><textarea className="admin-input admin-textarea" value={seo.description || ""} onChange={e => updateSetting("seo", "description", e.target.value)} /></div>
              <button onClick={() => save("seo")} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save SEO</button>
            </>)}

            {activeTab === "counters" && (<>
              <p className="text-[12px] mb-2" style={{ color: "var(--admin-ink-muted)" }}>These values are displayed on the public portfolio. Edit them to match your actual stats.</p>
              {[
                ["projects", "Projects"], ["certificates", "Certificates"], ["internships", "Internships"],
                ["courses", "Courses"], ["hackathons", "Hackathons"], ["competitions", "Competitions"],
                ["workshops", "Workshops"], ["github_commits", "GitHub Commits"],
                ["github_repos", "GitHub Repos"], ["experience_years", "Experience Years"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-4">
                  <label className="text-[13px] font-medium w-40" style={{ color: "var(--admin-ink)" }}>{label}</label>
                  <input type="number" className="admin-input" style={{ maxWidth: 120 }} value={counters[key] ?? 0}
                    onChange={e => updateSetting("counters", key, parseInt(e.target.value) || 0)} />
                </div>
              ))}
              <button onClick={() => save("counters")} disabled={saving} className="admin-btn admin-btn-primary mt-4">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Counters</button>
            </>)}

            {activeTab === "theme" && (<>
              <div className="admin-field">
                <label className="admin-label">Portfolio Default Theme</label>
                <select className="admin-input admin-select" value={(theme.portfolio_default_theme as string) || "pearl"}
                  onChange={e => updateSetting("theme", "portfolio_default_theme", e.target.value)}>
                  <option value="pearl">Pearl (Light)</option>
                  <option value="midnight">Midnight (Dark)</option>
                  <option value="aurora">Aurora</option>
                </select>
              </div>
              <button onClick={() => save("theme")} disabled={saving} className="admin-btn admin-btn-primary">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Theme</button>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}
