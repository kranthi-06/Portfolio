"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Trash2, Archive, Eye, EyeOff, Clock, Bell, Flag, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { supabaseBrowser } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string; name: string; email: string; subject: string; message: string;
  status: "unread" | "read" | "archived" | "spam"; created_at: string;
  read_at?: string | null;
  archived_at?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  source?: string;
  metadata?: any;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // Refs for callbacks to avoid circular dependencies
  const updateStatusRef = useRef(async (id: string, status: string) => {
    try { 
      await fetch("/api/admin/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); 
      fetchMessages(); 
    } catch (err) { console.error(err); toast.error("Failed"); }
  });
  const handleDeleteRef = useRef(async () => {
    if (!deleteTarget) return; 
    setDeleting(true);
    try { 
      await fetch(`/api/admin/messages?id=${deleteTarget.id}`, { method: "DELETE" }); 
      toast.success("Deleted"); 
      setDeleteTarget(null); 
      if (selected?.id === deleteTarget.id) setSelected(null); 
      fetchMessages(); 
    } catch (err) { console.error(err); toast.error("Failed"); } 
    finally { setDeleting(false); }
  });

  const fetchMessages = useCallback(async () => {
    try { 
      const res = await fetch("/api/admin/messages"); 
      if (res.ok) { 
        const { data } = await res.json(); 
        setMessages(data || []); 
      } 
    } catch (err) { console.error(err); toast.error("Failed to load"); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Set up Supabase Realtime subscription for new messages
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let mounted = true;

    async function setupRealtime() {
      try {
        const supabase = supabaseBrowser;
        if (!supabase) return;

        // Use a unique channel name per session to avoid conflicts
        const channelName = `admin_messages_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
            },
            (payload) => {
              if (!mounted) return;
              const newMessage = payload.new as Message;
              setMessages(prev => [newMessage, ...prev]);
              toast.success(`New message from ${newMessage.name}`, {
                icon: <MessageSquare size={16} />,
                action: {
                  label: "View",
                  onClick: () => openMessage(newMessage),
                },
              });
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "messages",
            },
            (payload) => {
              if (!mounted) return;
              const updatedMessage = payload.new as Message;
              setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
              if (selected?.id === updatedMessage.id) {
                setSelected(updatedMessage);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "DELETE",
              schema: "public",
              table: "messages",
            },
            (payload) => {
              if (!mounted) return;
              const deletedMessage = payload.old as Message;
              setMessages(prev => prev.filter(m => m.id !== deletedMessage.id));
              if (selected?.id === deletedMessage.id) {
                setSelected(null);
              }
            }
          )
          .subscribe((status) => {
            if (!mounted) return;
            if (status === "SUBSCRIBED") {
              setRealtimeStatus("connected");
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setRealtimeStatus("disconnected");
            }
          });
      } catch (err) {
        console.error("Realtime setup failed:", err);
        setRealtimeStatus("disconnected");
      }
    }

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) {
        supabaseBrowser?.removeChannel(channel);
      }
    };
  }, []); // Empty deps - only subscribe once on mount

  const updateStatus = useCallback((id: string, status: string) => updateStatusRef.current(id, status), []);
  const handleDelete = useCallback(() => handleDeleteRef.current(), [deleteTarget, selected]);

  const openMessage = useCallback((msg: Message) => {
    setSelected(msg);
    if (msg.status === "unread") updateStatusRef.current(msg.id, "read");
  }, []);

  const filtered = filter ? messages.filter(m => m.status === filter) : messages;
  const unreadCount = messages.filter(m => m.status === "unread").length;
  const spamCount = messages.filter(m => m.status === "spam").length;
  const archivedCount = messages.filter(m => m.status === "archived").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread": return "var(--admin-accent)";
      case "read": return "var(--admin-success)";
      case "archived": return "var(--admin-warning)";
      case "spam": return "var(--admin-danger)";
      default: return "var(--admin-ink-muted)";
    }
  };

  return (
    <div>
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title flex items-center gap-2">
            Messages
            <span className={`relative flex h-2.5 w-2.5 rounded-full ${realtimeStatus === "connected" ? "bg-emerald-500" : realtimeStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-gray-500"}`} title={realtimeStatus} />
          </h1>
          <p className="admin-page-subtitle">{unreadCount} unread · {messages.length} total</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchMessages} 
            disabled={loading}
            className="admin-btn admin-btn-ghost admin-btn-sm flex items-center gap-1"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="admin-tabs mb-0">
        <button className={`admin-tab ${!filter ? "active" : ""}`} onClick={() => setFilter("")}>
          All ({messages.length})
        </button>
        <button className={`admin-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
          Unread ({unreadCount})
        </button>
        <button className={`admin-tab ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
          Read
        </button>
        <button className={`admin-tab ${filter === "archived" ? "active" : ""}`} onClick={() => setFilter("archived")}>
          Archived ({archivedCount})
        </button>
        {spamCount > 0 && (
          <button className={`admin-tab ${filter === "spam" ? "active" : ""}`} onClick={() => setFilter("spam")} style={{ color: "var(--admin-danger)" }}>
            <Flag size={12} className="mr-1" /> Spam ({spamCount})
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-6">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="admin-card p-3"><div className="admin-skeleton h-4 w-3/4 mb-2" /><div className="admin-skeleton h-3 w-full" /></div>)
          ) : filtered.length === 0 ? (
            <EmptyState icon={<MessageSquare size={36} />} title="No messages" description={filter ? `No ${filter} messages` : "Contact form submissions will appear here."} />
          ) : (
            filtered.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => openMessage(msg)}
                className={`admin-card p-3 cursor-pointer transition-all hover:shadow-sm`}
                style={{
                  borderLeft: `3px solid ${getStatusColor(msg.status)}`,
                  background: selected?.id === msg.id ? "var(--admin-accent-soft)" : undefined,
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-[13px] truncate ${msg.status === "unread" ? "font-bold" : "font-medium"}`} style={{ color: "var(--admin-ink)" }}>{msg.name}</p>
                      {msg.status === "unread" && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--admin-accent)" }} />}
                      {msg.status === "spam" && <span title="Marked as spam"><Shield size={10} className="text-red-500" /></span>}
                    </div>
                    <p className="text-[11px] truncate" style={{ color: "var(--admin-ink-muted)" }}>{msg.subject || msg.message.slice(0, 60)}</p>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "var(--admin-ink-muted)" }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                {msg.visitor_id && (
                  <div className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="font-mono text-indigo-400">{msg.visitor_id.substring(0, 8)}…</span>
                    {msg.source && <span className="px-1 py-0.5 rounded bg-white/5">{msg.source}</span>}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="admin-card-title">{selected.subject || "No subject"}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${getStatusColor(selected.status)}20`, color: getStatusColor(selected.status) }}>
                      {selected.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: "var(--admin-ink-muted)" }}>
                    From: {selected.name} &nbsp;<a href={`mailto:${selected.email}`} className="hover:underline">{selected.email}</a>&nbsp;· {new Date(selected.created_at).toLocaleString()}
                    {selected.visitor_id && <span className="ml-2"> · Visitor: <code className="text-[10px] font-mono text-indigo-400">{selected.visitor_id.substring(0, 12)}…</code></span>}
                  </p>
                </div>
                <div className="flex gap-1">
                  <>
                    {selected.status !== "archived" && <button onClick={() => updateStatus(selected.id, "archived")} className="admin-btn admin-btn-ghost admin-btn-sm" title="Archive"><Archive size={12} /></button>}
                    {selected.status === "read" && <button onClick={() => updateStatus(selected.id, "unread")} className="admin-btn admin-btn-ghost admin-btn-sm" title="Mark unread"><EyeOff size={12} /></button>}
                    {selected.status === "unread" && <button onClick={() => updateStatus(selected.id, "read")} className="admin-btn admin-btn-ghost admin-btn-sm" title="Mark read"><Eye size={12} /></button>}
                    {selected.status !== "spam" && <button onClick={() => updateStatus(selected.id, "spam")} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }} title="Mark as spam"><Flag size={12} /></button>}
                    {selected.status === "spam" && <button onClick={() => updateStatus(selected.id, "unread")} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-warning)" }} title="Not spam"><Shield size={12} /></button>}
                    <button onClick={() => setDeleteTarget(selected)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }} title="Delete"><Trash2 size={12} /></button>
                  </>
                </div>
              </div>
              <div className="admin-card-body">
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--admin-ink-secondary)" }}>{selected.message}</p>
                {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                  <details className="mt-4">
                    <summary className="text-[11px] text-gray-500 cursor-pointer">Metadata</summary>
                    <pre className="mt-2 text-[10px] bg-[#0a0a0c] p-3 rounded overflow-auto" style={{ color: "var(--admin-ink-muted)" }}>
                      {JSON.stringify(selected.metadata, null, 2)}
                    </pre>
                  </details>
                )}
                <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid var(--admin-line)" }}>
                  <a href={`mailto:${selected.email}`} className="admin-btn admin-btn-primary admin-btn-sm"><Mail size={12} /> Reply via Email</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center">
              <MessageSquare size={32} style={{ color: "var(--admin-ink-muted)", margin: "0 auto 12px", opacity: 0.3 }} />
              <p className="text-[13px]" style={{ color: "var(--admin-ink-muted)" }}>Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Message" message="Delete this message permanently?" loading={deleting} />
    </div>
  );
}