"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, Copy, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";

const quickActions = [
  { label: "Improve text", action: "improve", description: "Make text more professional" },
  { label: "Shorten", action: "shorten", description: "Make it concise" },
  { label: "Expand", action: "expand", description: "Add more detail" },
  { label: "Rewrite", action: "rewrite", description: "Completely different phrasing" },
  { label: "Professional tone", action: "professional", description: "Formal portfolio style" },
];

export default function AIAssistantPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState("improve");

  async function handleGenerate() {
    if (!input.trim()) { toast.error("Enter some text first"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/improve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, action: selectedAction, context: "portfolio content" }),
      });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setOutput(data.result);
      toast.success("AI response generated!");
    } catch (err) { console.error(err); toast.error("AI generation failed"); }
    finally { setLoading(false); }
  }

  function copyOutput() { navigator.clipboard.writeText(output); toast.success("Copied to clipboard"); }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-2"><Sparkles size={22} style={{ color: "var(--admin-accent)" }} /> AI Assistant</h1>
        <p className="admin-page-subtitle">Use AI to improve, rewrite, and generate portfolio content</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="admin-card">
          <div className="admin-card-header"><h3 className="admin-card-title">Input</h3></div>
          <div className="admin-card-body">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {quickActions.map(a => (
                <button key={a.action}
                  onClick={() => setSelectedAction(a.action)}
                  className={`admin-btn admin-btn-sm ${selectedAction === a.action ? "admin-btn-primary" : "admin-btn-secondary"}`}
                  title={a.description}>
                  {a.label}
                </button>
              ))}
            </div>
            <textarea
              className="admin-input admin-textarea"
              rows={8}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your text here… AI will improve, shorten, expand, or rewrite it."
            />
            <button onClick={handleGenerate} disabled={loading || !input.trim()} className="admin-btn admin-btn-primary mt-3">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Wand2 size={14} /> Generate</>}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Output</h3>
            {output && (
              <div className="flex gap-1">
                <button onClick={copyOutput} className="admin-btn admin-btn-ghost admin-btn-sm"><Copy size={12} /> Copy</button>
                <button onClick={handleGenerate} disabled={loading} className="admin-btn admin-btn-ghost admin-btn-sm"><RefreshCw size={12} /> Retry</button>
              </div>
            )}
          </div>
          <div className="admin-card-body">
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 size={24} className="animate-spin mb-3" style={{ color: "var(--admin-accent)" }} />
                <p className="text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>AI is thinking…</p>
              </div>
            ) : output ? (
              <div className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--admin-ink)" }}>
                {output}
              </div>
            ) : (
              <div className="flex flex-col items-center py-12">
                <Sparkles size={32} style={{ color: "var(--admin-ink-muted)", opacity: 0.3 }} />
                <p className="text-[13px] mt-3" style={{ color: "var(--admin-ink-muted)" }}>AI output will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
