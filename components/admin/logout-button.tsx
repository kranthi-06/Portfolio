"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return <button type="button" onClick={async () => { await supabaseBrowser.auth.signOut(); router.replace("/admin/login"); router.refresh(); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"><LogOut size={16} /> Log out</button>;
}
