"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setLoading(true);
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    setLoading(false);
    if (signInError) { setError("Unable to sign in. Check your credentials and try again."); return; }
    router.replace("/admin"); router.refresh();
  }

  return <main className="min-h-screen bg-[#f8f8fa] p-5 text-zinc-950 sm:grid sm:place-items-center"><section className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,.08)] sm:p-10"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white"><LockKeyhole size={20} /></div><p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-zinc-500">Portfolio CMS</p><h1 className="mb-3 font-display text-3xl font-semibold tracking-tight">Welcome back.</h1><p className="mb-8 text-sm leading-relaxed text-zinc-600">Sign in to manage the portfolio, media library, and AI content workflow.</p><form onSubmit={handleSubmit} className="space-y-4"><label className="block text-sm font-semibold">Email<input required name="email" type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 outline-none transition focus:border-zinc-950" /></label><label className="block text-sm font-semibold">Password<input required name="password" type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 outline-none transition focus:border-zinc-950" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button disabled={loading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60">{loading ? "Signing in…" : <>Sign in <ArrowRight size={16} /></>}</button></form></section></main>;
}
