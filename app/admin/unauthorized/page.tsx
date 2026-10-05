"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Safe landing page for users who are authenticated but are NOT admins.
 *
 * This page is intentionally reachable while signed in as a non-admin (the
 * middleware allows it) so that "signed in but unauthorized" can never turn
 * into an /admin → /admin/login → /admin redirect loop.
 */
export default function AdminUnauthorizedPage() {
  const router = useRouter();

  async function handleSwitchAccount() {
    await supabaseBrowser.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8f8fa] p-5 text-zinc-950 sm:grid sm:place-items-center">
      <section className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,.08)] sm:p-10">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <ShieldAlert size={20} />
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-zinc-500">403 — Not authorized</p>
        <h1 className="mb-3 font-display text-3xl font-semibold tracking-tight">Admin access required.</h1>
        <p className="mb-8 text-sm leading-relaxed text-zinc-600">
          You are signed in, but this account does not have the <span className="font-semibold">admin</span> role,
          so the admin area is not available. Sign in with an admin account to continue.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <LogOut size={16} /> Sign out &amp; switch account
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <ArrowLeft size={16} /> Back to portfolio
          </Link>
        </div>
      </section>
    </main>
  );
}
