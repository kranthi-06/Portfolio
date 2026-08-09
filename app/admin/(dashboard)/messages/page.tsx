"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Trash2, Archive, Eye, EyeOff, Clock } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface Message {
  id: string; name: string; email: string; subject: string; message: string;
  status: "unread" | "read" | "archived"; created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchMessages() {
    try { const res = await fetch("/api/admin/messages"); if (res.ok) { const { data } = await res.json(); setMessages(data || []); } }
    catch (err) { console.error(err); toast.error("Failed to load"); } finally { setLoading(false); }
  }

  useEffect(() => { fetchMessages(); }, []);

  async function updateStatus(id: string, status: string) {
    try { await fetch("/api/admin/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); fetchMessages(); }
    catch (err) { console.error(err); toast.error("Failed"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return; setDeleting(true);
    try { await fetch(`/api/admin/messages?id=${deleteTarget.id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteTarget(null); if (selected?.id === deleteTarget.id) setSelected(null); fetchMessages(); }
    catch (err) { console.error(err); toast.error("Failed"); } finally { setDeleting(false); }
  }

  function openMessage(msg: Message) {
    setSelected(msg);
    if (msg.status === "unread") updateStatus(msg.id, "read");
  }

  const filtered = filter ? messages.filter(m => m.status === filter) : messages;
  const unreadCount = messages.filter(m => m.status === "unread").length;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Messages</h1>
        <p className="admin-page-subtitle">{unreadCount} unread · {messages.length} total</p>
      </div>

      <div className="admin-tabs mb-0">
        <button className={`admin-tab ${!filter ? "active" : ""}`} onClick={() => setFilter("")}>All ({messages.length})</button>
        <button className={`admin-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>Unread ({unreadCount})</button>
        <button className={`admin-tab ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>Read</button>
        <button className={`admin-tab ${filter === "archived" ? "active" : ""}`} onClick={() => setFilter("archived")}>Archived</button>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-6">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="admin-card p-3"><div className="admin-skeleton h-4 w-3/4 mb-2" /><div className="admin-skeleton h-3 w-full" /></div>)
          ) : filtered.length === 0 ? (
            <EmptyState icon={<MessageSquare size={36} />} title="No messages" description="Contact form submissions will appear here." />
          ) : (
            filtered.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => openMessage(msg)}
                className={`admin-card p-3 cursor-pointer transition-all hover:shadow-sm ${selected?.id === msg.id ? "" : ""}`}
                style={{
                  borderLeft: msg.status === "unread" ? "3px solid var(--admin-accent)" : "3px solid transparent",
                  background: selected?.id === msg.id ? "var(--admin-accent-soft)" : undefined,
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-[13px] truncate ${msg.status === "unread" ? "font-bold" : "font-medium"}`} style={{ color: "var(--admin-ink)" }}>{msg.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--admin-ink-muted)" }}>{msg.subject || msg.message.slice(0, 60)}</p>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "var(--admin-ink-muted)" }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
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
                  <h3 className="admin-card-title">{selected.subject || "No subject"}</h3>
                  <p className="text-[12px] mt-1" style={{ color: "var(--admin-ink-muted)" }}>
                    From: {selected.name} &lt;{selected.email}&gt; · {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {selected.status !== "archived" && <button onClick={() => updateStatus(selected.id, "archived")} className="admin-btn admin-btn-ghost admin-btn-sm"><Archive size={12} /></button>}
                  {selected.status === "read" && <button onClick={() => updateStatus(selected.id, "unread")} className="admin-btn admin-btn-ghost admin-btn-sm"><EyeOff size={12} /></button>}
                  <button onClick={() => setDeleteTarget(selected)} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: "var(--admin-danger)" }}><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="admin-card-body">
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--admin-ink-secondary)" }}>{selected.message}</p>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--admin-line)" }}>
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
