import { useState } from "react";
import { AIModal } from "./ai-modal";
import { Sparkles } from "lucide-react";

interface AIAssistantFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  contextType?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
  hideLabel?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  children?: React.ReactNode;
}

export function AIAssistantField({
  label,
  value,
  onChange,
  multiline = false,
  contextType,
  placeholder,
  className = "",
  rows = 4,
  hideLabel = false,
  onKeyDown,
  children
}: AIAssistantFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="admin-field w-full">
      {label && !hideLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="admin-label !mb-0">{label}</label>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles size={12} /> AI Assist
          </button>
        </div>
      )}
      
      <div className="relative group">
        {(!label || hideLabel) && (
           <button
             type="button"
             onClick={() => setModalOpen(true)}
             className="absolute right-2 top-2 z-10 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
           >
             <Sparkles size={12} /> AI
           </button>
        )}
        
        {children ? (
          children
        ) : multiline ? (
          <textarea
            className={`admin-input admin-textarea w-full ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            onKeyDown={onKeyDown}
          />
        ) : (
          <input
            type="text"
            className={`admin-input w-full ${!label && !hideLabel ? "pr-16" : ""} ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
          />
        )}
      </div>

      {modalOpen && (
        <AIModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          originalText={value}
          contextType={contextType}
          onAccept={(newText) => onChange(newText)}
        />
      )}
    </div>
  );
}
