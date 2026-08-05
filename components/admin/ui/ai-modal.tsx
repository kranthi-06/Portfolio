import { useState, useEffect, useRef } from "react";
import { AdminModal } from "./modal";
import { AIToolbar } from "./ai-toolbar";
import { AIAction, AITone } from "@/lib/ai/prompts";
import { computeWordDiff } from "@/lib/utils/diff";
import { Loader2, Copy, Check, Send, Undo2, Redo2 } from "lucide-react";
import { toast } from "sonner";

interface AIModalProps {
  open: boolean;
  onClose: () => void;
  originalText: string;
  contextType?: string;
  onAccept: (newText: string) => void;
}

export function AIModal({ open, onClose, originalText, contextType, onAccept }: AIModalProps) {
  const [tone, setTone] = useState<AITone | "">("");
  const [customPrompt, setCustomPrompt] = useState("");
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [currentText, setCurrentText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [diffMode, setDiffMode] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setHistory([originalText]);
      setHistoryIndex(0);
      setCurrentText(originalText);
      setTone("");
      setCustomPrompt("");
      setDiffMode(false);
    }
  }, [open, originalText]);

  const addToHistory = (text: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(text);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentText(history[historyIndex + 1]);
    }
  };

  const handleGenerate = async (action: AIAction | 'custom') => {
    if (loading) return;
    
    setLoading(true);
    setCurrentText("");
    let accumulatedText = "";
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/admin/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: history[historyIndex],
          action,
          customPrompt: action === 'custom' ? customPrompt : undefined,
          tone: tone || undefined,
          contextType
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || "Failed to generate text");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          setCurrentText(accumulatedText);
        }
      }
      
      addToHistory(accumulatedText.trim());
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.info("Generation cancelled");
      } else {
        toast.error(err instanceof Error ? err.message : "An error occurred during generation");
        console.error(err);
      }
      setCurrentText(history[historyIndex]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="AI Content Assistant"
      maxWidth="800px"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0 || loading} 
              className="admin-icon-btn" 
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1 || loading} 
              className="admin-icon-btn" 
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
            <span className="text-[11px] ml-2" style={{ color: "var(--admin-ink-muted)" }}>
              Version {historyIndex + 1} of {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="admin-btn admin-btn-secondary">Cancel</button>
            <button 
              onClick={() => {
                onAccept(currentText);
                onClose();
              }} 
              disabled={loading || currentText === originalText} 
              className="admin-btn admin-btn-primary"
            >
              <Check size={14} /> Accept Changes
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <AIToolbar 
          onAction={(action) => handleGenerate(action)}
          tone={tone}
          setTone={setTone}
          loading={loading}
        />

        <div className="flex gap-2">
          <input 
            type="text" 
            className="admin-input flex-1" 
            placeholder="Tell AI what to do..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && customPrompt && handleGenerate('custom')}
            disabled={loading}
          />
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={() => handleGenerate('custom')}
            disabled={!customPrompt || loading}
          >
            <Send size={14} /> Send
          </button>
        </div>

        <div className="border rounded-xl flex flex-col overflow-hidden" style={{ borderColor: "var(--admin-border)", height: "300px" }}>
          <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: "var(--admin-line)", background: "var(--admin-bg-subtle)" }}>
            <div className="flex items-center gap-4 text-[12px] font-medium" style={{ color: "var(--admin-ink-secondary)" }}>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={diffMode} 
                  onChange={(e) => setDiffMode(e.target.checked)} 
                  className="rounded"
                />
                Highlight Changes
              </label>
            </div>
            <div className="flex items-center gap-2">
               {loading && (
                 <button onClick={handleCancel} className="text-[11px] text-red-500 hover:underline">
                   Stop Generating
                 </button>
               )}
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(currentText);
                   toast.success("Copied to clipboard");
                 }} 
                 className="admin-icon-btn"
                 title="Copy text"
               >
                 <Copy size={14} />
               </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-white/5 whitespace-pre-wrap text-[13px] leading-relaxed relative">
            {loading && currentText.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center text-[12px]" style={{ color: "var(--admin-ink-muted)" }}>
                 <Loader2 size={16} className="animate-spin mr-2" /> AI is thinking...
               </div>
            )}
            
            {diffMode && historyIndex > 0 ? (
              <DiffViewer oldText={history[historyIndex - 1]} newText={currentText} />
            ) : (
              currentText
            )}
            
            {loading && currentText.length > 0 && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse align-middle" />
            )}
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

function DiffViewer({ oldText, newText }: { oldText: string, newText: string }) {
  const diffs = computeWordDiff(oldText, newText);
  
  return (
    <>
      {diffs.map((part, i) => {
        if (part.added) return <span key={i} className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded px-0.5">{part.value}</span>;
        if (part.removed) return <span key={i} className="bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded px-0.5 line-through">{part.value}</span>;
        return <span key={i}>{part.value}</span>;
      })}
    </>
  );
}
