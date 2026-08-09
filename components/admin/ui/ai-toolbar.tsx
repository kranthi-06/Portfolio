import { Sparkles, Wand2, ArrowLeftRight, Maximize2, Minimize2, LucideIcon } from "lucide-react";
import { AIActions, AITones, AIAction, AITone } from "@/lib/ai/prompts";

interface AIToolbarProps {
  onAction: (action: AIAction) => void;
  tone: AITone | "";
  setTone: (tone: AITone | "") => void;
  loading?: boolean;
}

export function AIToolbar({ onAction, tone, setTone, loading }: AIToolbarProps) {
  const commonActions: { id: AIAction; label: string; icon: LucideIcon }[] = [
    { id: "optimize", label: "Optimize", icon: Sparkles },
    { id: "rewrite", label: "Rewrite", icon: ArrowLeftRight },
    { id: "expand", label: "Expand", icon: Maximize2 },
    { id: "shorten", label: "Shorten", icon: Minimize2 },
    { id: "humanize", label: "Humanize", icon: Wand2 },
  ];

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border mb-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-bg-subtle)" }}>
      <div className="flex flex-wrap items-center gap-2">
        {commonActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              disabled={loading}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <Icon size={14} /> {action.label}
            </button>
          );
        })}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t pt-3 mt-1" style={{ borderColor: "var(--admin-line)" }}>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[12px] font-medium whitespace-nowrap" style={{ color: "var(--admin-ink-secondary)" }}>Tone & Style:</label>
          <select 
            className="admin-input flex-1 !py-1.5 !text-[13px]" 
            value={tone} 
            onChange={(e) => setTone(e.target.value as AITone | "")}
            disabled={loading}
          >
            <option value="">Default Tone</option>
            {Object.keys(AITones).map((key) => (
              <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[12px] font-medium whitespace-nowrap" style={{ color: "var(--admin-ink-secondary)" }}>More Actions:</label>
          <select 
            className="admin-input flex-1 !py-1.5 !text-[13px]"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onAction(e.target.value as AIAction);
                e.target.value = "";
              }
            }}
            disabled={loading}
          >
            <option value="">Select Action...</option>
            {Object.keys(AIActions).map((key) => (
              <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
