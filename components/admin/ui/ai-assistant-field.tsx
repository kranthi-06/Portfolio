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
}

export function AIAssistantField({
  label,
  value,
  onChange,
  multiline = false,
  contextType,
  placeholder,
  className = "",
  rows = 4
}: AIAssistantFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="admin-field w-full">
      {label && (
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
        {!label && (
           <button
             type="button"
             onClick={() => setModalOpen(true)}
             className="absolute right-2 top-2 z-10 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
           >
             <Sparkles size={12} /> AI
           </button>
        )}
        
        {multiline ? (
          <textarea
            className={`admin-input admin-textarea w-full ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
          />
        ) : (
          <input
            type="text"
            className={`admin-input w-full ${!label ? "pr-16" : ""} ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
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
